"""Pydantic schemas for request/response validation."""

from typing import Optional

from pydantic import BaseModel, Field


class Scene(BaseModel):
    """Describes the static hardware setup that persists across all steps.

    All physical parts (including any controller board, breadboard, sensors,
    etc.) should be specified in the modules list.
    """

    modules: list[str] = Field(
        default_factory=list,
        description=(
            "List of parts/modules in the scene (e.g. 'arduino_nano', 'breadboard', "
            "'tft_display', 'button', 'servo_motor')."
        ),
    )


class Style(BaseModel):
    """Visual style options for the generated images."""

    camera: str = Field(
        default="top_down",
        description="Camera angle: 'top_down', 'isometric', 'front'.",
    )
    background: str = Field(
        default="white",
        description="Background color or style.",
    )
    render: str = Field(
        default="photo",
        description="Render style: 'photo' (realistic) or 'illustration'.",
    )
    aspect_ratio: str = Field(
        default="16:9",
        description="Output aspect ratio, e.g. '16:9', '4:3', '1:1'.",
    )


class Step(BaseModel):
    """A single assembly step."""

    id: Optional[int] = Field(
        default=None,
        description="Step identifier (auto-assigned if not provided).",
    )
    human_description: str = Field(
        ...,
        description="Natural-language description of what happens in this step.",
    )


class ReferenceImage(BaseModel):
    """Reference image of a real part or module used as visual context."""

    label: Optional[str] = Field(
        default=None,
        description="Short name for the part, e.g. 'arduino_uno_board_photo'.",
    )
    description: Optional[str] = Field(
        default=None,
        description="Optional description of what the reference photo shows.",
    )
    image_b64: str = Field(
        ...,
        description="Base64-encoded image data (PNG or JPEG).",
    )
    mime_type: str = Field(
        default="image/png",
        description="MIME type of the encoded image, e.g. 'image/png' or 'image/jpeg'.",
    )


class AssemblyRequest(BaseModel):
    """Top-level request body for generating assembly step images."""

    project_id: Optional[str] = Field(
        default=None,
        description="Optional project identifier for logging/caching.",
    )
    title: Optional[str] = Field(
        default=None,
        description="Human-readable title for the project.",
    )
    scene: Scene = Field(
        default_factory=Scene,
        description="Static hardware scene description.",
    )
    style: Style = Field(
        default_factory=Style,
        description="Visual style options.",
    )
    reference_images: list[ReferenceImage] = Field(
        default_factory=list,
        description=(
            "Optional reference images of real parts/modules to provide visual "
            "context to the model."
        ),
    )
    steps: list[Step] = Field(
        ...,
        min_length=1,
        description="Ordered list of assembly steps (at least one required).",
    )


class StepImage(BaseModel):
    """A generated image for a single step."""

    step: int
    image_b64: str


class AssemblyResponse(BaseModel):
    """Response containing all generated step images."""

    project_id: Optional[str] = None
    images: list[StepImage]
