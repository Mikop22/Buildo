import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
from llm_config import LLM_CONFIG
from services.parts_storing import get_by_cat_subcat

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
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
    "Power": ["Management"]
}

def search_parts_by_keywords(category: str, subcategory: str, keywords: list, limit: int = 3) -> list:
    parts = get_by_cat_subcat(category, subcategory)
    results = []
    
    for part in parts:
        name_lower = part.get("name", "").lower()
        for kw in keywords:
            if kw.lower() in name_lower:
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
    
    # Build output with matched parts from database
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
    
    return output
