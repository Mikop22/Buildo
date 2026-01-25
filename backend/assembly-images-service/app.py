"""Flask application entry point."""

import logging
import sys

from flask import Flask
from flask_cors import CORS

from config import config
from routes import api_bp


def create_app() -> Flask:
    """Application factory for the assembly-images microservice."""
    # Configure logging
    logging.basicConfig(
        level=logging.DEBUG if config.DEBUG else logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        stream=sys.stdout,
    )

    app = Flask(__name__)
    app.config["DEBUG"] = config.DEBUG
    
    # Enable CORS for frontend
    CORS(app, origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"])

    # Register blueprints
    app.register_blueprint(api_bp)

    # Log startup info
    logger = logging.getLogger(__name__)
    logger.info(f"Assembly Images Service starting (debug={config.DEBUG})")
    logger.info(f"Using image model: {config.IMAGE_MODEL}")
    logger.info(f"Max steps per request: {config.MAX_STEPS}")

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=config.DEBUG)
