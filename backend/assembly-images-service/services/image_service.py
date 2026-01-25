"""Image generation service using Google Gemini."""

from __future__ import annotations

import base64
import io
import logging
from typing import Optional

from google import genai
from google.genai import types
from PIL import Image

# Enable AVIF support in Pillow
try:
    import pillow_avif  # noqa: F401
except ImportError:
    pass  # AVIF support optional

from config import config
from schemas import AssemblyRequest, StepImage

logger = logging.getLogger(__name__)


class ImageGenerationService:
    """Generates step-by-step assembly images using Gemini image generation."""

    def __init__(self) -> None:
        self.client = genai.Client(api_key=config.GEMINI_API_KEY)
        self.model = config.IMAGE_MODEL

    def _build_step_prompt(
        self,
        request: AssemblyRequest,
        step_index: int,
        is_first_step: bool,
    ) -> str:
        """Build the prompt for a specific step.

        Creates a freeze-frame style prompt: generate an image showing how the
        project should look after completing this step's instruction.
        """
        step = request.steps[step_index]
        step_num = step.id if step.id is not None else step_index + 1

        if is_first_step:
            # First step: no previous image context
            prompt = (
                f"Create a freeze frame of how this hardware project should look "
                f"after completing step {step_num}.\n\n"
                f"Step {step_num} instruction: {step.human_description}\n\n"
                f"Use the provided reference photos of the parts as visual guidance "
                f"for what the components look like.\n\n"
                f"Requirements:\n"
                f"- White background\n"
                f"- Neutral lighting\n"
                f"- Top-down overhead view\n"
                f"- No hands\n"
                f"- No text, labels, or annotations in the image\n"
                f"- Crisp focus\n"
                f"- Instructional style"
            )
        else:
            # Subsequent steps: include previous image as context
            prompt = (
                f"Create a freeze frame of how this hardware project should look "
                f"after completing step {step_num}.\n\n"
                f"The first image shows how the project looked after the previous step. "
                f"Use it as the starting point.\n\n"
                f"Step {step_num} instruction: {step.human_description}\n\n"
                f"Use the provided reference photos of the parts as visual guidance "
                f"for what the components look like.\n\n"
                f"Requirements:\n"
                f"- White background\n"
                f"- Neutral lighting\n"
                f"- Top-down overhead view\n"
                f"- No hands\n"
                f"- No text, labels, or annotations in the image\n"
                f"- Crisp focus\n"
                f"- Instructional style\n"
                f"- Maintain the same camera angle and framing as the previous step"
            )
        return prompt

    def _pil_image_to_base64(self, image: Image.Image) -> str:
        """Convert a PIL Image to base64-encoded PNG string."""
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        buffer.seek(0)
        return base64.b64encode(buffer.read()).decode("utf-8")

    def _pil_image_to_part(self, image: Image.Image) -> types.Part:
        """Convert a PIL Image to a Gemini Part for use in contents."""
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        buffer.seek(0)
        return types.Part.from_bytes(data=buffer.read(), mime_type="image/png")

    def _bytes_to_base64(self, data: bytes) -> str:
        """Convert raw image bytes to base64 string."""
        return base64.b64encode(data).decode("utf-8")

    def _bytes_to_part(self, data: bytes, mime_type: str = "image/png") -> types.Part:
        """Convert raw image bytes to a Gemini Part."""
        return types.Part.from_bytes(data=data, mime_type=mime_type)

    # Gemini supported image formats
    SUPPORTED_MIME_TYPES = {"image/png", "image/jpeg", "image/gif", "image/webp"}

    def _convert_to_supported_format(self, data: bytes, mime_type: str) -> tuple[bytes, str]:
        """Convert unsupported image formats (like AVIF) to PNG.

        Args:
            data: Raw image bytes
            mime_type: Original MIME type

        Returns:
            Tuple of (converted_bytes, new_mime_type)
        """
        if mime_type in self.SUPPORTED_MIME_TYPES:
            return data, mime_type

        # Convert unsupported format to PNG using PIL
        try:
            logger.info(f"Converting unsupported format {mime_type} to PNG")
            image = Image.open(io.BytesIO(data))
            # Convert to RGB if necessary (for formats with alpha or different modes)
            if image.mode in ("RGBA", "LA", "P"):
                # Create white background for transparency
                background = Image.new("RGB", image.size, (255, 255, 255))
                if image.mode == "P":
                    image = image.convert("RGBA")
                background.paste(image, mask=image.split()[-1] if image.mode == "RGBA" else None)
                image = background
            elif image.mode != "RGB":
                image = image.convert("RGB")

            buffer = io.BytesIO()
            image.save(buffer, format="PNG")
            buffer.seek(0)
            return buffer.read(), "image/png"
        except Exception as e:
            logger.warning(f"Failed to convert image from {mime_type} to PNG: {e}")
            # Return original data and hope for the best
            return data, mime_type

    def _build_reference_parts(self, request: AssemblyRequest) -> list[types.Part]:
        """Build Gemini parts for any provided reference images.

        These images give the model visual context for what real parts look like
        (e.g. the exact Arduino board, display module, or button you are using).
        Automatically converts unsupported formats (like AVIF) to PNG.
        """
        parts: list[types.Part] = []
        for ref in request.reference_images:
            try:
                data = base64.b64decode(ref.image_b64)
                # Convert unsupported formats to PNG
                converted_data, converted_mime = self._convert_to_supported_format(data, ref.mime_type)
                parts.append(types.Part.from_bytes(data=converted_data, mime_type=converted_mime))
            except Exception as exc:  # pragma: no cover - defensive logging
                label = ref.label or "<unnamed>"
                logger.warning("Failed to decode reference image '%s': %s", label, exc)
        return parts

    def generate_step_images(self, request: AssemblyRequest) -> list[StepImage]:
        """Generate images for all steps in the assembly request.

        For step 1, generates from text only.
        For subsequent steps, passes the previous image to maintain visual consistency.
        """
        results: list[StepImage] = []
        cumulative_descriptions: list[str] = []
        previous_image_bytes: Optional[bytes] = None
        previous_image_mime: str = "image/png"
        reference_parts = self._build_reference_parts(request)

        for step_index, step in enumerate(request.steps):
            step_num = step.id if step.id is not None else step_index + 1
            is_first_step = previous_image_bytes is None
            logger.info(f"Generating image for step {step_num}")

            # Build the prompt for this step
            prompt = self._build_step_prompt(request, step_index, is_first_step)
            logger.debug(f"Step {step_num} prompt: {prompt[:200]}...")

            # Build contents
            if is_first_step:
                # First step: reference photos (if any) + prompt
                contents = [*reference_parts, prompt] if reference_parts else [prompt]
            else:
                # Subsequent steps: previous image + reference photos + prompt
                image_part = self._bytes_to_part(previous_image_bytes, previous_image_mime)
                contents = [image_part, *reference_parts, prompt]

            # Call Gemini
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=contents,
                )

                # Extract image from response
                image_bytes: Optional[bytes] = None
                image_mime: str = "image/png"
                
                # Check if response has parts
                if response and hasattr(response, 'parts') and response.parts:
                    for part in response.parts:
                        if part and hasattr(part, 'inline_data') and part.inline_data is not None:
                            image_bytes = part.inline_data.data
                            image_mime = part.inline_data.mime_type or "image/png"
                            break
                else:
                    # Try alternative response structure
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
                    logger.error(f"No image generated for step {step_num}. Response: {response}")
                    raise RuntimeError(f"Gemini did not return an image for step {step_num}")

                # Convert to base64 and store
                image_b64 = self._bytes_to_base64(image_bytes)
                results.append(StepImage(step=step_num, image_b64=image_b64))

                # Update state for next iteration
                previous_image_bytes = image_bytes
                previous_image_mime = image_mime
                cumulative_descriptions.append(step.human_description)

                logger.info(f"Successfully generated image for step {step_num}")

            except Exception as e:
                logger.exception(f"Error generating image for step {step_num}: {e}")
                raise

        return results
