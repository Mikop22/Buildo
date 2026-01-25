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


@api_bp.route("/health", methods=["GET"])
def health_check():
    """Simple health check endpoint."""
    return jsonify({"status": "ok"}), 200
