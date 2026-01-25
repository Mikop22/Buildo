from flask import Flask, request, jsonify
from services.gemini import fetch_parts_by_category
from services.snowflake import generate_code_and_steps
from services.cache import get_cached, save_cached

app = Flask(__name__)

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    if not data or 'description' not in data:
        return jsonify({'error': 'Missing description'}), 400
    description = data['description']
    cached = get_cached(description)
    if cached:
        return jsonify(cached)
    parts_by_category = fetch_parts_by_category(description)
    code_steps = generate_code_and_steps(parts_by_category)
    result = dict(parts_by_category)
    result["assembly_steps"] = code_steps["assembly_steps"]
    save_cached(description, result)
    return jsonify(result)

if __name__ == '__main__':
    app.run()
