"""Flask routes for the assembly-images API."""

import logging

from flask import Blueprint, jsonify, request
from pydantic import ValidationError

from config import config
from schemas import AssemblyRequest, AssemblyResponse
from typing import Optional

from services.image_service import ImageGenerationService

logger = logging.getLogger(__name__)

api_bp = Blueprint("api", __name__, url_prefix="/v1")

# Singleton service instance
_image_service: Optional[ImageGenerationService] = None


def get_image_service() -> ImageGenerationService:
    """Get or create the image generation service singleton."""
    global _image_service
    if _image_service is None:
        _image_service = ImageGenerationService()
    return _image_service


@api_bp.route("/assembly-images", methods=["POST"])
def generate_assembly_images():
    """Generate step-by-step assembly images from a hardware project description.

    Request body (JSON):
        {
            "project_id": "optional-id",
            "title": "Optional project title",
            "scene": {
                "board": "arduino_uno",
                "breadboard": "full",
                "modules": ["tft_display", "button"]
            },
            "style": {
                "camera": "top_down",
                "background": "white",
                "render": "photo",
                "aspect_ratio": "16:9"
            },
            "steps": [
                {"human_description": "Place the Arduino Uno on the left side of the breadboard"},
                {"human_description": "Connect a red wire from 5V to the power rail"}
            ]
        }

    Returns:
        {
            "project_id": "...",
            "images": [
                {"step": 1, "image_b64": "base64-encoded-png"},
                {"step": 2, "image_b64": "base64-encoded-png"}
            ]
        }
    """
    # Parse and validate request
    try:
        data = request.get_json()
        if data is None:
            return jsonify({"error": "Request body must be JSON"}), 400

        assembly_request = AssemblyRequest.model_validate(data)
    except ValidationError as e:
        logger.warning(f"Validation error: {e}")
        return jsonify({"error": "Invalid request", "details": e.errors()}), 400
    except Exception as e:
        logger.warning(f"Failed to parse request: {e}")
        return jsonify({"error": "Failed to parse request body"}), 400

    # Check step limit
    if len(assembly_request.steps) > config.MAX_STEPS:
        return jsonify({
            "error": f"Too many steps. Maximum allowed: {config.MAX_STEPS}"
        }), 400

    # Generate images
    try:
        service = get_image_service()
        step_images = service.generate_step_images(assembly_request)

        response = AssemblyResponse(
            project_id=assembly_request.project_id,
            images=step_images,
        )
        return jsonify(response.model_dump()), 200

    except RuntimeError as e:
        logger.error(f"Image generation failed: {e}")
        return jsonify({"error": str(e)}), 502
    except Exception as e:
        logger.exception(f"Unexpected error during image generation: {e}")
        return jsonify({"error": "Internal server error"}), 500


@api_bp.route("/assembly-image", methods=["POST"])
def generate_single_assembly_image():
    """Generate a single assembly step image (for progressive loading).
    
    Request body (JSON):
        {
            "project_id": "optional-id",
            "title": "Optional project title",
            "scene": { "modules": ["arduino", "breadboard"] },
            "reference_images": [...],
            "step": { "id": 1, "human_description": "Step 1: ..." },
            "previous_image_b64": "base64-encoded-png or null for first step"
        }
    
    Returns:
        {
            "step": 1,
            "image_b64": "base64-encoded-png"
        }
    """
    try:
        data = request.get_json()
        if data is None:
            return jsonify({"error": "Request body must be JSON"}), 400
        
        # Validate required fields
        if "step" not in data:
            return jsonify({"error": "Missing 'step' field"}), 400
        
        step_data = data["step"]
        step_id = step_data.get("id", 1)
        human_description = step_data.get("human_description", "")
        
        if not human_description:
            return jsonify({"error": "Step description is required"}), 400
        
        # Build a minimal AssemblyRequest for single step
        from schemas import Step, Scene, ReferenceImage
        step = Step(id=step_id, human_description=human_description)
        
        scene = Scene(modules=data.get("scene", {}).get("modules", []))
        reference_images = [
            ReferenceImage(**ref) for ref in data.get("reference_images", [])
        ]
        
        # Create request with single step
        assembly_request = AssemblyRequest(
            project_id=data.get("project_id"),
            title=data.get("title"),
            scene=scene,
            reference_images=reference_images,
            steps=[step]
        )
        
        # Get previous image if provided
        previous_image_b64 = data.get("previous_image_b64")
        previous_image_bytes = None
        previous_image_mime = "image/png"
        if previous_image_b64:
            import base64
            try:
                previous_image_bytes = base64.b64decode(previous_image_b64)
            except Exception as e:
                logger.warning(f"Failed to decode previous image: {e}")
        
        # Generate single image using service's internal method
        service = get_image_service()
        
        # Build reference parts
        reference_parts = service._build_reference_parts(assembly_request)
        
        # Build prompt
        is_first_step = previous_image_bytes is None
        prompt = service._build_step_prompt(assembly_request, 0, is_first_step)
        
        # Build contents
        if is_first_step:
            contents = [*reference_parts, prompt] if reference_parts else [prompt]
        else:
            image_part = service._bytes_to_part(previous_image_bytes, previous_image_mime)
            contents = [image_part, *reference_parts, prompt]
        
        # Call Gemini
        from google.genai import types
        response = service.client.models.generate_content(
            model=service.model,
            contents=contents,
        )
        
        # Extract image from response
        image_bytes = None
        image_mime = "image/png"
        
        if response and hasattr(response, 'parts') and response.parts:
            for part in response.parts:
                if part and hasattr(part, 'inline_data') and part.inline_data is not None:
                    image_bytes = part.inline_data.data
                    image_mime = part.inline_data.mime_type or "image/png"
                    break
        else:
            if response and hasattr(response, 'candidates') and response.candidates:
                for candidate in response.candidates:
                    if candidate and hasattr(candidate, 'content') and candidate.content:
                        content = candidate.content
                        if hasattr(content, 'parts') and content.parts:
                            for part in content.parts:
                                if part and hasattr(part, 'inline_data') and part.inline_data is not None:
                                    image_bytes = part.inline_data.data
                                    image_mime = part.inline_data.mime_type or "image/png"
                                    break
                            if image_bytes:
                                break
        
        if image_bytes is None:
            logger.error(f"No image generated for step {step_id}")
            return jsonify({"error": f"Gemini did not return an image for step {step_id}"}), 500
        
        # Convert to base64
        image_b64 = service._bytes_to_base64(image_bytes)
        
        from schemas import StepImage
        result = StepImage(step=step_id, image_b64=image_b64)
        
        return jsonify(result.model_dump()), 200
        
    except Exception as e:
        logger.exception(f"Error generating single step image: {e}")
        return jsonify({"error": str(e)}), 500


@api_bp.route("/health", methods=["GET"])
def health_check():
    """Simple health check endpoint."""
    return jsonify({"status": "ok"}), 200
