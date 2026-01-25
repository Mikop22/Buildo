"""
Image Generation Service using Gemini API

Generates final build images using Gemini's image generation model with templates.
"""
import os
import base64
from datetime import datetime
from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.types import Modality
from llm_config import GEMINI_IMAGE_CONFIG

# Load .env file from backend directory
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
if os.path.exists(env_path):
    try:
        load_dotenv(env_path, encoding='utf-8')
    except UnicodeDecodeError:
        try:
            with open(env_path, 'r', encoding='utf-16') as f:
                content = f.read()
            with open(env_path, 'w', encoding='utf-8', newline='\n') as f:
                f.write(content)
            print("Converted .env file from UTF-16 to UTF-8")
            load_dotenv(env_path, encoding='utf-8')
        except Exception as e:
            print(f"Error converting .env file: {e}")
            load_dotenv()
else:
    load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError(
        "GEMINI_API_KEY not found in environment variables. "
        "Please create a .env file in the backend/ directory with: GEMINI_API_KEY=your_key_here"
    )

client = genai.Client(api_key=GEMINI_API_KEY)

# Load final build image generation templates
FINAL_BUILD_TEMPLATES_PATH = os.path.join(os.path.dirname(__file__), "..", "templates", "gemini", "final_build")
with open(os.path.join(FINAL_BUILD_TEMPLATES_PATH, "system_prompt.txt"), "r", encoding="utf-8") as f:
    FINAL_BUILD_SYSTEM_PROMPT = f.read()
with open(os.path.join(FINAL_BUILD_TEMPLATES_PATH, "user_prompt.txt"), "r", encoding="utf-8") as f:
    FINAL_BUILD_USER_PROMPT_TMPL = f.read()


def generate_final_build_image(parts_by_category: dict, description: str):
    """
    Generate an image of the final assembled build using Gemini image generation.
    
    Args:
        parts_by_category: Dictionary with nested structure containing matched parts
        description: User's device description
        
    Returns:
        Base64 encoded image string, or None if generation fails
    """
    # Extract part names from the parts structure
    parts_list = []
    for category, subcategories in parts_by_category.items():
        if category in ["firmware", "assembly_steps"]:
            continue
        if not subcategories or not isinstance(subcategories, dict):
            continue
        
        for subcategory, parts in subcategories.items():
            if not isinstance(parts, list):
                continue
            for part in parts:
                if isinstance(part, dict):
                    part_name = part.get("name") or part.get("title", "")
                    if part_name:
                        parts_list.append(part_name)
    
    if not parts_list:
        print("No parts found to generate final build image")
        return None
    
    # Format parts list for the prompt
    parts_list_text = "\n".join([f"- {part}" for part in parts_list])
    
    # Build user prompt with parts and description
    user_prompt = FINAL_BUILD_USER_PROMPT_TMPL.format(
        description=description,
        parts_list=parts_list_text
    )
    
    try:
        response = client.models.generate_content(
            model=GEMINI_IMAGE_CONFIG["model"],
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=FINAL_BUILD_SYSTEM_PROMPT,
                response_modalities=[Modality.IMAGE],
                temperature=GEMINI_IMAGE_CONFIG["temperature"],
                max_output_tokens=GEMINI_IMAGE_CONFIG["max_tokens"]
            )
        )
        
        # Extract image from response
        candidates = response.candidates
        if candidates:
            content = candidates[0].content
            parts = content.parts
            for part in parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    image_data = part.inline_data.data
                    
                    # Convert to base64 string
                    if isinstance(image_data, bytes):
                        base64_str = base64.b64encode(image_data).decode('utf-8')
                    else:
                        # It's a base64 string - clean it and ensure proper padding
                        base64_str = image_data.strip().replace('\n', '').replace('\r', '').replace(' ', '')
                        # Add padding if needed
                        missing_padding = len(base64_str) % 4
                        if missing_padding:
                            base64_str += '=' * (4 - missing_padding)
                    
                    # Save image to backend folder
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    safe_description = "".join(c if c.isalnum() or c in (' ', '-', '_') else '' for c in description[:30])
                    safe_description = safe_description.replace(' ', '_')
                    filename = f"final_build_{safe_description}_{timestamp}.png"
                    backend_dir = os.path.dirname(os.path.dirname(__file__))
                    filepath = os.path.join(backend_dir, filename)
                    
                    # Decode and save image
                    image_bytes = base64.b64decode(base64_str)
                    with open(filepath, "wb") as f:
                        f.write(image_bytes)
                    
                    print(f"Image saved to: {filepath}")
                    
                    # Return base64 string
                    return base64_str
        
        print("No image data returned from Gemini API")
        return None
        
    except Exception as e:
        print(f"Error generating final build image: {e}")
        import traceback
        traceback.print_exc()
        return None
