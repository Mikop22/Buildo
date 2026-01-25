import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
from llm_config import LLM_CONFIG
from services.parts_storing import get_by_cat_subcat

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

TEMPLATES_PATH = os.path.join(os.path.dirname(__file__), "..", "templates", "gemini")
with open(os.path.join(TEMPLATES_PATH, "system_prompt.txt"), "r", encoding="utf-8") as f:
    SYSTEM_PROMPT = f.read()
with open(os.path.join(TEMPLATES_PATH, "user_prompt.txt"), "r", encoding="utf-8") as f:
    USER_PROMPT_TMPL = f.read()

VALID_CATEGORIES = {
    "Microcontrollers": ["ESP", "Arduino", "RP2040", "STM"],
    "Sensors": ["Environmental", "Gas", "Motion"],
    "Actuators": ["Motors", "Relays"],
    "Displays": ["OLED", "LCD"],
    "Power": ["Management"],
    "Components": ["Prototyping", "Connectors", "Lighting"]
}

def search_parts_by_keywords(category: str, subcategory: str, keywords: list, limit: int = 3) -> list:
    parts = get_by_cat_subcat(category, subcategory)
    if not parts:
        return []
    
    results = []
    
    for part in parts:
        name_lower = part.get("name", "").lower()
        for kw in keywords:
            kw_lower = kw.lower().strip()
            # More flexible matching: check if keyword appears as whole word or substring
            if kw_lower in name_lower:
                results.append(part)
                break
    
    results.sort(key=lambda x: (x.get("rating") or 0, -(x.get("price") or 999)), reverse=True)
    return results[:limit]


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
    
    raw_output = response.candidates[0].content.parts[0].text.strip()
    print("Gemini RAW output:", raw_output)
    
    requested_parts = json.loads(raw_output)
    
    # Check if Components is missing
    if "Components" not in requested_parts:
        print("WARNING: Components category missing from Gemini output!")
    
    # Fallback: Auto-detect common component keywords from description
    description_lower = description.lower()
    component_keywords = {}
    
    breadboard_words = ["breadboard", "protoboard", "prototype"]
    wire_words = ["wire", "cable", "jumper", "dupont", "connector"]
    led_words = ["led", "light", "lighting", "diode"]
    
    if any(word in description_lower for word in breadboard_words):
        if "Prototyping" not in component_keywords:
            component_keywords["Prototyping"] = []
        component_keywords["Prototyping"].extend(["breadboard", "MB-102"])
    
    if any(word in description_lower for word in wire_words):
        if "Connectors" not in component_keywords:
            component_keywords["Connectors"] = []
        component_keywords["Connectors"].extend(["jumper wire", "dupont"])
    
    if any(word in description_lower for word in led_words):
        if "Lighting" not in component_keywords:
            component_keywords["Lighting"] = []
        component_keywords["Lighting"].extend(["LED", "light emitting diode"])
    
    # Merge fallback keywords if Components is empty or missing
    if component_keywords:
        if "Components" not in requested_parts:
            requested_parts["Components"] = {}
        for subcat, keywords in component_keywords.items():
            # Always use fallback keywords if Components was empty or subcategory is missing
            if subcat not in requested_parts["Components"] or not requested_parts["Components"][subcat]:
                requested_parts["Components"][subcat] = keywords
            else:
                # Merge keywords if both exist
                existing = requested_parts["Components"][subcat]
                merged = list(set(existing + keywords))
                requested_parts["Components"][subcat] = merged
    
    # Ensure all required categories are present (Gemini sometimes omits them)
    for category in VALID_CATEGORIES.keys():
        if category not in requested_parts:
            requested_parts[category] = {}
    
    # Build output with matched parts from database - ensure ALL categories are present
    output = {cat: {} for cat in VALID_CATEGORIES.keys()}
    
    for category, subcats in requested_parts.items():
        if category not in VALID_CATEGORIES:
            continue
        if not isinstance(subcats, dict):
            continue
            
        for subcategory, keywords in subcats.items():
            if subcategory not in VALID_CATEGORIES.get(category, []):
                continue
            if not isinstance(keywords, list) or not keywords:
                continue
            
            # Search for matching parts
            matched_parts = search_parts_by_keywords(category, subcategory, keywords)
            if matched_parts:
                output[category][subcategory] = matched_parts
    
    # Ensure Components is always present in output (even if empty)
    if "Components" not in output:
        output["Components"] = {}
    
    return output
