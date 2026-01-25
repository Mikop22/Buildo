import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from llm_config import LLM_CONFIG
from services.parts_catalog import PARTS_DATA

# Load .env file from backend directory
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
if os.path.exists(env_path):
    try:
        load_dotenv(env_path, encoding='utf-8')
    except UnicodeDecodeError:
        # File might be UTF-16 - try to read and convert to UTF-8
        try:
            with open(env_path, 'r', encoding='utf-16') as f:
                content = f.read()
            # Write back as UTF-8
            with open(env_path, 'w', encoding='utf-8', newline='\n') as f:
                f.write(content)
            print("Converted .env file from UTF-16 to UTF-8")
            load_dotenv(env_path, encoding='utf-8')
        except Exception as e:
            print(f"Error converting .env file: {e}")
            print("Please delete backend/.env and recreate it as UTF-8 (no BOM)")
            load_dotenv()  # Fallback
else:
    load_dotenv()  # Try loading from current directory

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError(
        "GEMINI_API_KEY not found in environment variables. "
        "Please create a .env file in the backend/ directory with: GEMINI_API_KEY=your_key_here"
    )

client = genai.Client(api_key=GEMINI_API_KEY)

TEMPLATES_PATH = os.path.join(os.path.dirname(__file__), "..", "templates")
with open(os.path.join(TEMPLATES_PATH, "system_prompt.txt"), "r", encoding="utf-8") as f:
    SYSTEM_PROMPT = f.read()
with open(os.path.join(TEMPLATES_PATH, "user_prompt.txt"), "r", encoding="utf-8") as f:
    USER_PROMPT_TMPL = f.read()

def fetch_parts_by_category(description: str) -> dict:
    user_prompt = USER_PROMPT_TMPL.format(description=description)

    response = client.models.generate_content(
        model=LLM_CONFIG["model"],
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            temperature=LLM_CONFIG["temperature"],
            max_output_tokens=LLM_CONFIG["max_tokens"]
        )
    )
    categories = response.candidates[0].content.parts[0].text.strip()
    print("Gemini RAW output:", categories)  # For debugging
    import json
    requested_parts = json.loads(categories)
    output = {key: [] for key in [
        "controller", "power", "communication", "inputs", "outputs", "interconnect", "mechanical"
    ]}
    for key in output.keys():
        titles = requested_parts.get(key, [])
        for part in PARTS_DATA.get(key, []):
            if part["title"] in titles:
                output[key].append(part)
    return output
