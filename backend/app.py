from flask import Flask, request, jsonify
from services.gemini import fetch_parts_by_category
from services.snowflake import generate_code_and_steps
from services.cache import get_cached, save_cached
from services.image_generator import generate_assembled_product_image

app = Flask(__name__)

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    if not data or 'description' not in data:
        return jsonify({'error': 'Missing description'}), 400
    description = data['description']
    # Check cache but skip if it has old format (has 'generated_part_image' instead of 'assembled_product_image')
    cached = get_cached(description)
    if cached and 'assembled_product_image' in cached:
        return jsonify(cached)
    # If cache has old format, regenerate
    parts_by_category = fetch_parts_by_category(description)
    code_steps = generate_code_and_steps(parts_by_category)
    
    # Generate assembled product image with all parts put together
    assembled_image = generate_assembled_product_image(parts_by_category, description)
    
    # Build result with parts and generated assembled image
    result = dict(parts_by_category)
    result["assembly_steps"] = code_steps["assembly_steps"]
    
    # Add the assembled product image
    if assembled_image:
        result["assembled_product_image"] = {
            "imageUrl": assembled_image,
            "description": description,
            "parts": []
        }
        
        # Include list of all parts used in the assembly (handling nested structure)
        for category, subcategories in parts_by_category.items():
            if category not in ["firmware", "assembly_steps"]:
                if not subcategories:
                    continue
                
                # Handle nested structure: category -> subcategory -> list of parts
                if isinstance(subcategories, dict):
                    for subcategory, parts in subcategories.items():
                        if not parts:
                            continue
                        for part in parts:
                            if isinstance(part, dict):
                                part_title = part.get("title") or part.get("name", "")
                            else:
                                part_title = str(part)
                            if part_title:
                                result["assembled_product_image"]["parts"].append({
                                    "category": category,
                                    "subcategory": subcategory,
                                    "title": part_title
                                })
                # Handle flat structure (legacy support)
                elif isinstance(subcategories, list):
                    for part in subcategories:
                        if isinstance(part, dict):
                            part_title = part.get("title") or part.get("name", "")
                        else:
                            part_title = str(part)
                        if part_title:
                            result["assembled_product_image"]["parts"].append({
                                "category": category,
                                "title": part_title
                            })
    
    save_cached(description, result)
    return jsonify(result)

if __name__ == '__main__':
    app.run()
