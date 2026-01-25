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

TEMPLATES_PATH = os.path.join(os.path.dirname(__file__), "..", "templates", "gemini", "parts")
with open(os.path.join(TEMPLATES_PATH, "system_prompt.txt"), "r", encoding="utf-8") as f:
    SYSTEM_PROMPT = f.read()
with open(os.path.join(TEMPLATES_PATH, "user_prompt.txt"), "r", encoding="utf-8") as f:
    USER_PROMPT_TMPL = f.read()

# Load final build image generation templates
FINAL_BUILD_TEMPLATES_PATH = os.path.join(os.path.dirname(__file__), "..", "templates", "gemini", "final_build")
with open(os.path.join(FINAL_BUILD_TEMPLATES_PATH, "system_prompt.txt"), "r", encoding="utf-8") as f:
    FINAL_BUILD_SYSTEM_PROMPT = f.read()
with open(os.path.join(FINAL_BUILD_TEMPLATES_PATH, "user_prompt.txt"), "r", encoding="utf-8") as f:
    FINAL_BUILD_USER_PROMPT_TMPL = f.read()

VALID_CATEGORIES = {
    "Microcontrollers": ["Arduino", "ESP", "RP2040", "STM"],
    "Sensors": ["Environmental", "Gas", "Motion"],
    "Actuators": ["Motors", "Relays"],
    "Displays": ["LCD", "OLED"],
    "Power": ["Management"],
    "Power & Batteries": ["Batteries", "Battery Holders", "Chargers", "Regulators"],
    "Prototyping": ["Breadboards", "Perfboard", "Proto Kits"],
    "Wiring & Cables": ["Connectors", "Jumper Wires", "Ribbon Cables", "USB & Power Cables"],
    "Connectivity": ["Cellular", "LoRa", "Wi-Fi/BLE", "Zigbee/Thread"],
    "Cameras & Vision": ["Camera Modules", "Image Sensors", "Lenses"],
    "Compute & AI Modules": ["Edge AI", "MCU Boards", "Single Board"],
    "Enclosures & Mounting": ["Cases", "Heat Management", "Mounting"],
    "Motion & Mobility": ["Chassis", "Drivers", "Motors", "Wheels"],
    "Tools & Test": ["Hand Tools", "Measurement", "Soldering"],
}

def search_parts_by_keywords(category: str, subcategory: str, part_descriptions: list, limit: int = 1) -> list:
    """
    Search for parts matching the given descriptions.
    
    Args:
        category: The category to search in
        subcategory: The subcategory to search in  
        part_descriptions: List of part description strings from Gemini (e.g., "Arduino UNO R3 ATmega328P")
        limit: Max parts to return per description (default 1 = best match only)
    
    Returns:
        List of matched parts, ranked by keyword match count
    """
    parts = get_by_cat_subcat(category, subcategory)
    if not parts:
        return []
    
    all_results = []
    
    for description in part_descriptions:
        # Split description into individual keywords
        keywords = [kw.lower().strip() for kw in description.split() if len(kw.strip()) > 1]
        
        scored_parts = []
        for part in parts:
            name_lower = part.get("name", "").lower()
            
            # Count how many keywords match
            match_count = sum(1 for kw in keywords if kw in name_lower)
            
            if match_count > 0:
                scored_parts.append({
                    "part": part,
                    "match_count": match_count,
                    "match_ratio": match_count / len(keywords) if keywords else 0
                })
        
        # Sort by: match_count (desc), then rating (desc), then price (asc)
        scored_parts.sort(key=lambda x: (
            x["match_count"],
            x["part"].get("rating") or 0,
            -(x["part"].get("price") or 999)
        ), reverse=True)
        
        # Take top matches for this description
        for scored in scored_parts[:limit]:
            part = scored["part"]
            # Avoid duplicates
            if part not in all_results:
                all_results.append(part)
    
    return all_results


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
    
    # Fallback: Auto-detect common component keywords from description
    description_lower = description.lower()
    
    breadboard_words = ["breadboard", "protoboard", "prototype"]
    wire_words = ["wire", "cable", "jumper", "dupont", "connector"]
    display_words = ["lcd", "oled", "display", "screen"]
    
    # If description mentions displays, automatically add breadboard and wires
    has_display = any(word in description_lower for word in display_words)
    
    # Fallback for Prototyping category
    if any(word in description_lower for word in breadboard_words) or has_display:
        if "Prototyping" not in requested_parts:
            requested_parts["Prototyping"] = {}
        if "Breadboards" not in requested_parts["Prototyping"] or not requested_parts["Prototyping"]["Breadboards"]:
            requested_parts["Prototyping"]["Breadboards"] = ["breadboard", "MB-102"]
    
    # Fallback for Wiring & Cables category
    if any(word in description_lower for word in wire_words) or has_display:
        if "Wiring & Cables" not in requested_parts:
            requested_parts["Wiring & Cables"] = {}
        if "Jumper Wires" not in requested_parts["Wiring & Cables"] or not requested_parts["Wiring & Cables"]["Jumper Wires"]:
            requested_parts["Wiring & Cables"]["Jumper Wires"] = ["jumper wire", "dupont"]
    
    # Build output with matched parts from database - only include categories with actual parts
    output = {}
    
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
                if category not in output:
                    output[category] = {}
                output[category][subcategory] = matched_parts
    
    return output
