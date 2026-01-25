"""
Image Generation Service using Gemini API

Generates images for parts using Gemini's image generation model.
"""
import os
import requests
from typing import Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_IMAGE_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent"


def select_part_for_image(parts_by_category: Dict) -> Optional[Dict]:
    """
    Selects one part from all categories to generate an image for.
    Prioritizes parts from Microcontrollers, Actuators, or Sensors categories.
    
    Args:
        parts_by_category: Dictionary with nested structure:
            {
                "Microcontrollers": {"ESP": [part_dict, ...], "Arduino": [part_dict, ...]},
                "Sensors": {"Environmental": [part_dict, ...]},
                ...
            }
        
    Returns:
        A single part dictionary, or None if no parts are available
    """
    # Priority order for selecting which category to pick from
    priority_categories = ["Microcontrollers", "Actuators", "Sensors", "Displays", "Power"]
    
    # Try to find a part from priority categories
    for category in priority_categories:
        subcategories = parts_by_category.get(category, {})
        if not subcategories:
            continue
        
        # Handle nested structure
        if isinstance(subcategories, dict):
            for subcategory, parts in subcategories.items():
                if parts:
                    # Return the first part from this subcategory
                    part = parts[0]
                    return {
                        "part": part,
                        "category": category,
                        "subcategory": subcategory
                    }
        # Handle flat structure (legacy support)
        elif isinstance(subcategories, list):
            if subcategories:
                part = subcategories[0]
                return {
                    "part": part,
                    "category": category
                }
    
    # If no parts found in priority categories, search all categories
    for category, subcategories in parts_by_category.items():
        if category in ["firmware", "assembly_steps"]:
            continue
        
        if not subcategories:
            continue
        
        # Handle nested structure
        if isinstance(subcategories, dict):
            for subcategory, parts in subcategories.items():
                if parts:
                    part = parts[0]
                    return {
                        "part": part,
                        "category": category,
                        "subcategory": subcategory
                    }
        # Handle flat structure (legacy support)
        elif isinstance(subcategories, list):
            if subcategories:
                part = subcategories[0]
                return {
                    "part": part,
                    "category": category
                }
    
    return None


def generate_part_image(part: Dict, device_description: str = "") -> Optional[str]:
    """
    Generates an image for a part using Gemini's image generation API.
    
    Args:
        part: Dictionary containing part information (title, description, etc.)
        device_description: Optional device description for context
        
    Returns:
        Base64 encoded image data URL, or None if generation fails
    """
    if not GEMINI_API_KEY:
        print("Warning: GEMINI_API_KEY not set, cannot generate image")
        return None
    
    # Build prompt for image generation
    part_title = part.get("title", "electronic component")
    part_description = part.get("description", "")
    
    prompt = f"Generate a clear, professional product image of a {part_title}"
    if part_description:
        prompt += f". {part_description}"
    if device_description:
        prompt += f" This part is used in a {device_description}."
    prompt += " The image should be clean, well-lit, and show the part clearly on a neutral background."
    
    try:
        response = requests.post(
            f"{GEMINI_IMAGE_API_URL}?key={GEMINI_API_KEY}",
            json={
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "responseModalities": ["TEXT", "IMAGE"],
                    "temperature": 0.7
                }
            },
            timeout=30
        )
        
        if response.status_code != 200:
            error_data = response.json() if response.content else {}
            error_msg = error_data.get('error', {}).get('message', response.text)
            print(f"Gemini API error: {error_msg}")
            return None
        
        data = response.json()
        
        # Extract image data from response
        candidates = data.get('candidates', [])
        if candidates:
            content = candidates[0].get('content', {})
            parts = content.get('parts', [])
            for part_data in parts:
                if 'inlineData' in part_data:
                    image_data = part_data['inlineData'].get('data')
                    if image_data:
                        # Remove data URL prefix if present
                        if image_data.startswith('data:image'):
                            image_data = image_data.split(',')[1]
                        return f"data:image/png;base64,{image_data}"
        
        print("No image data returned from Gemini API")
        return None
        
    except requests.exceptions.Timeout:
        print("Request to Gemini API timed out")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Failed to call Gemini API: {str(e)}")
        return None
    except Exception as e:
        print(f"Unexpected error generating image: {str(e)}")
        return None


def generate_image_for_selected_part(parts_by_category: Dict, device_description: str = "") -> Optional[Dict]:
    """
    Selects one part and generates an image for it.
    
    Args:
        parts_by_category: Dictionary with categories as keys and lists of parts as values
        device_description: Optional device description for context
        
    Returns:
        Dictionary with part info and generated image URL, or None if no parts or generation fails
    """
    selected = select_part_for_image(parts_by_category)
    if not selected:
        return None
    
    part = selected["part"]
    category = selected["category"]
    
    image_url = generate_part_image(part, device_description)
    if not image_url:
        return None
    
    return {
        "part": {
            "title": part.get("title"),
            "category": category,
            "description": part.get("description"),
            "generated_image": image_url
        }
    }


def generate_images_for_all_parts(parts_by_category: Dict, device_description: str = "") -> Dict:
    """
    Generates images for ALL parts in all categories.
    
    Args:
        parts_by_category: Dictionary with nested structure:
            {
                "Microcontrollers": {"ESP": [part_dict, ...], "Arduino": [part_dict, ...]},
                "Sensors": {"Environmental": [part_dict, ...]},
                ...
            }
        device_description: Optional device description for context
        
    Returns:
        Dictionary with nested structure containing parts with generated images
    """
    result = {}
    
    # Iterate through all categories
    for category, subcategories in parts_by_category.items():
        # Skip non-part categories
        if category in ["firmware", "assembly_steps"]:
            continue
        
        if not subcategories:
            continue
        
        # Handle nested structure
        if isinstance(subcategories, dict):
            category_result = {}
            for subcategory, parts in subcategories.items():
                if not parts:
                    continue
                
                # Generate images for all parts in this subcategory
                parts_with_images = []
                for part in parts:
                    image_url = generate_part_image(part, device_description)
                    
                    # Create part dict with image
                    part_with_image = dict(part)  # Copy the part dict
                    if image_url:
                        part_with_image["generated_image"] = image_url
                    else:
                        part_with_image["generated_image"] = None
                    
                    parts_with_images.append(part_with_image)
                
                if parts_with_images:
                    category_result[subcategory] = parts_with_images
            
            if category_result:
                result[category] = category_result
        # Handle flat structure (legacy support)
        elif isinstance(subcategories, list):
            parts_with_images = []
            for part in subcategories:
                image_url = generate_part_image(part, device_description)
                
                # Create part dict with image
                part_with_image = dict(part)  # Copy the part dict
                if image_url:
                    part_with_image["generated_image"] = image_url
                else:
                    part_with_image["generated_image"] = None
                
                parts_with_images.append(part_with_image)
            
            if parts_with_images:
                result[category] = parts_with_images
    
    return result


def generate_assembled_product_image(parts_by_category: Dict, device_description: str = "") -> Optional[str]:
    """
    Generates a single image showing the complete assembled product with all parts put together.
    
    Args:
        parts_by_category: Dictionary with nested structure:
            {
                "Microcontrollers": {"ESP": [part_dict, ...], "Arduino": [part_dict, ...]},
                "Sensors": {"Environmental": [part_dict, ...]},
                ...
            }
        device_description: Optional device description for context
        
    Returns:
        Base64 encoded image data URL of the assembled product, or None if generation fails
    """
    if not GEMINI_API_KEY:
        print("Warning: GEMINI_API_KEY not set, cannot generate image")
        return None
    
    # Collect all parts from all categories (handling nested structure)
    all_parts_list = []
    for category, subcategories in parts_by_category.items():
        # Skip non-part categories
        if category in ["firmware", "assembly_steps"]:
            continue
        
        if not subcategories:
            continue
        
        # Handle nested structure: category -> subcategory -> list of parts
        if isinstance(subcategories, dict):
            for subcategory, parts in subcategories.items():
                if not parts:
                    continue
                
                # Extract part names/titles from this subcategory
                for part in parts:
                    if isinstance(part, dict):
                        part_title = part.get("title") or part.get("name", "")
                        # Also get description if available for better context
                        part_desc = part.get("description", "")
                    else:
                        part_title = str(part)
                        part_desc = ""
                    
                    if part_title:
                        part_entry = f"{category}/{subcategory}: {part_title}"
                        if part_desc:
                            part_entry += f" ({part_desc})"
                        all_parts_list.append(part_entry)
        # Handle flat structure (legacy support)
        elif isinstance(subcategories, list):
            for part in subcategories:
                if isinstance(part, dict):
                    part_title = part.get("title") or part.get("name", "")
                    part_desc = part.get("description", "")
                else:
                    part_title = str(part)
                    part_desc = ""
                
                if part_title:
                    part_entry = f"{category}: {part_title}"
                    if part_desc:
                        part_entry += f" ({part_desc})"
                    all_parts_list.append(part_entry)
    
    if not all_parts_list:
        print("No parts found to generate assembled product image")
        return None
    
    print(f"Generating assembled product image with {len(all_parts_list)} parts:")
    for part in all_parts_list:
        print(f"  - {part}")
    
    # Build prompt for assembled product image - focus on the parts and device description
    parts_text = "\n".join([f"- {part}" for part in all_parts_list])
    
    # Create a more detailed parts description (extract just the part names)
    parts_description = ", ".join([
        part.split(": ")[1].split(" (")[0] if ": " in part else part.split(" (")[0] 
        for part in all_parts_list
    ])
    
    # Build comprehensive prompt
    prompt = f"Generate a clear, professional product image showing a complete assembled electronic device.\n\n"
    if device_description:
        prompt += f"Device Description: {device_description}\n\n"
    prompt += f"The device is assembled from these specific parts:\n{parts_text}\n\n"
    prompt += f"Show how these parts ({parts_description}) are integrated together into a working {device_description or 'electronic device'}. "
    prompt += "The image should show:\n"
    prompt += "- All parts properly assembled and physically connected together\n"
    prompt += "- The complete device as a finished, functional product\n"
    prompt += "- Clean, professional presentation on a neutral background\n"
    prompt += "- Clear visibility of how all components are connected and work together\n"
    prompt += "- Realistic proportions showing the actual size relationships between parts\n"
    prompt += "- Proper integration showing wires, connections, and physical assembly\n"
    prompt += "- The device should look like a complete, working product ready to use"
    
    try:
        response = requests.post(
            f"{GEMINI_IMAGE_API_URL}?key={GEMINI_API_KEY}",
            json={
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "responseModalities": ["TEXT", "IMAGE"],
                    "temperature": 0.7
                }
            },
            timeout=30
        )
        
        if response.status_code != 200:
            error_data = response.json() if response.content else {}
            error_msg = error_data.get('error', {}).get('message', response.text)
            print(f"Gemini API error: {error_msg}")
            return None
        
        data = response.json()
        
        # Extract image data from response
        candidates = data.get('candidates', [])
        if candidates:
            content = candidates[0].get('content', {})
            parts = content.get('parts', [])
            for part_data in parts:
                if 'inlineData' in part_data:
                    image_data = part_data['inlineData'].get('data')
                    if image_data:
                        # Remove data URL prefix if present
                        if image_data.startswith('data:image'):
                            image_data = image_data.split(',')[1]
                        return f"data:image/png;base64,{image_data}"
        
        print("No image data returned from Gemini API")
        return None
        
    except requests.exceptions.Timeout:
        print("Request to Gemini API timed out")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Failed to call Gemini API: {str(e)}")
        return None
    except Exception as e:
        print(f"Unexpected error generating image: {str(e)}")
        return None
