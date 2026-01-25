from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import requests
from services.gemini import fetch_parts_by_category
from services.snowflake import generate_code_and_steps, generate_skeleton_code
from services.cache import get_cached, save_cached
from services.image_generator import generate_final_build_image

app = Flask(__name__)
# Enable CORS for all origins (frontend can be on various domains)
CORS(app, supports_credentials=True)

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
    code_steps = generate_code_and_steps(parts_by_category, description)
    
    # Generate skeleton code for the device
    print(f"[Code Generation] Starting code generation for: {description}")
    try:
        skeleton_code = generate_skeleton_code(
            parts_by_category, 
            description, 
            code_steps["assembly_steps"]
        )
        if skeleton_code:
            print(f"[Code Generation] Code generated successfully ({len(skeleton_code)} chars)")
        else:
            print("[Code Generation] No code generated (device may not require programming)")
    except Exception as e:
        print(f"[Code Generation] Error generating code: {e}")
        import traceback
        traceback.print_exc()
        skeleton_code = None
    
    # Generate assembled product image with all parts put together
    assembled_image = generate_final_build_image(parts_by_category, description)
    
    # Build result with parts and generated assembled image
    result = dict(parts_by_category)
    result["assembly_steps"] = code_steps["assembly_steps"]
    
    # Add firmware code if generated
    if skeleton_code:
        result["firmware"] = skeleton_code
    
    # Add the assembled product image
    if assembled_image:
        result["assembled_product_image"] = {
            "imageUrl": f"data:image/png;base64,{assembled_image}",
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


@app.route('/proxy-image', methods=['GET'])
def proxy_image():
    """Proxy endpoint to fetch remote images and bypass CORS restrictions."""
    url = request.args.get('url')
    if not url:
        return jsonify({'error': 'Missing url parameter'}), 400
    
    try:
        # Fetch the image from the remote URL
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Return the image with appropriate content type
        content_type = response.headers.get('content-type', 'image/png')
        return Response(
            response.content,
            mimetype=content_type,
            headers={
                'Cache-Control': 'public, max-age=3600'
            }
        )
    except requests.RequestException as e:
        return jsonify({'error': f'Failed to fetch image: {str(e)}'}), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    app.run()
