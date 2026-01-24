from flask import Flask, request, jsonify
from services.gemini import generate_parts_and_spec
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
    parts_spec = generate_parts_and_spec(description)
    code_steps = generate_code_and_steps(parts_spec["device_spec"])
    result = {
        "device_spec": parts_spec["device_spec"],
        "parts_list": parts_spec["parts_list"],
        "firmware": code_steps["firmware"],
        "assembly_steps": code_steps["assembly_steps"]
    }
    save_cached(description, result)
    return jsonify(result)

if __name__ == '__main__':
    app.run()
