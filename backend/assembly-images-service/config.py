"""Application configuration loaded from environment variables."""

import os
from dotenv import load_dotenv

# Load .env from parent directory (backend/.env)
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)


class Config:
    """Settings for the assembly-images microservice."""

    # Google GenAI / Gemini
    GEMINI_API_KEY: str = os.environ.get("GEMINI_API_KEY", "")
    IMAGE_MODEL: str = os.environ.get("IMAGE_MODEL", "gemini-3-pro-image-preview")

    # Request limits
    MAX_STEPS: int = int(os.environ.get("MAX_STEPS", "20"))
    REQUEST_TIMEOUT_SECONDS: int = int(os.environ.get("REQUEST_TIMEOUT_SECONDS", "120"))

    # Flask
    DEBUG: bool = os.environ.get("FLASK_DEBUG", "0") == "1"


config = Config()
