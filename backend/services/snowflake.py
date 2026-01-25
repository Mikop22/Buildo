import os
import json
import snowflake.connector
from dotenv import load_dotenv

load_dotenv()

def get_snowflake_conn():
    return snowflake.connector.connect(
        user=os.getenv('SNOWFLAKE_USER'),
        password=os.getenv('SNOWFLAKE_PASSWORD'),
        account=os.getenv('SNOWFLAKE_ACCOUNT', 'YG65395.ca-central-1.aws'),
        warehouse=os.getenv('SNOWFLAKE_WAREHOUSE'),
        database=os.getenv('SNOWFLAKE_DATABASE'),
        schema='PUBLIC',
        role='ACCOUNTADMIN'
    )

def call_cortex(prompt):
    conn = get_snowflake_conn()
    cur = conn.cursor()
    
    escaped_prompt = prompt.replace("'", "''")
    
    cur.execute(f"""
        SELECT SNOWFLAKE.CORTEX.COMPLETE(
            'claude-3-5-sonnet',
            '{escaped_prompt}'
        )
    """)
    
    result = cur.fetchone()
    cur.close()
    conn.close()
    
    return result[0] if result else None

def generate_code_and_steps(parts_by_category: dict) -> dict:
    parts_json = json.dumps(parts_by_category, indent=2)
    
    TEMPLATES_PATH = os.path.join(os.path.dirname(__file__), "..", "templates", "snowflake")
    
    with open(os.path.join(TEMPLATES_PATH, "system_prompt.txt"), "r", encoding="utf-8") as f:
        system_prompt = f.read()
    with open(os.path.join(TEMPLATES_PATH, "user_prompt.txt"), "r", encoding="utf-8") as f:
        user_prompt_template = f.read()
    
    firmware_task = "Generate complete, working firmware code for this hardware setup using these parts:"
    firmware_requirements = """Requirements:
- Proper pin definitions based on the parts
- Sensor reading functions (if sensors are present)
- Actuator control functions (if actuators are present)
- Display output functions (if displays are present)
- Main loop logic
- Comments explaining each section
- Include necessary libraries

Return ONLY the code, no explanations or markdown formatting."""
    
    assembly_task = "Generate step-by-step assembly instructions for putting together this device using these parts:"
    assembly_requirements = """Provide clear, straightforward, step-by-step instructions covering:
- Component preparation and identification
- Physical assembly order
- Wiring connections with specific pin assignments
- Power connections and safety considerations
- Display connections (if applicable)
- Final testing procedures

Return ONLY a JSON array of strings, where each string is one clear instruction step. Example format:
["Step 1: Prepare all components and identify each part", "Step 2: Connect the ESP32 to the breadboard", "Step 3: Connect the soil moisture sensor to pin 5", ...]

Make each step clear, actionable, and easy to follow. Do not include any text outside the JSON array."""
    
    firmware_user = user_prompt_template.format(
        task_description=firmware_task,
        parts_json=parts_json,
        requirements=firmware_requirements
    )
    firmware_prompt = f"{system_prompt}\n\n{firmware_user}"
    
    assembly_user = user_prompt_template.format(
        task_description=assembly_task,
        parts_json=parts_json,
        requirements=assembly_requirements
    )
    assembly_prompt = f"{system_prompt}\n\n{assembly_user}"

    firmware = call_cortex(firmware_prompt) or "// Error generating firmware"
    
    assembly_response = call_cortex(assembly_prompt) or "[]"
    try:
        assembly_steps = json.loads(assembly_response)
        if not isinstance(assembly_steps, list):
            assembly_steps = [assembly_steps]
    except:
        assembly_steps = ["Error generating assembly steps"]
    
    return {
        "firmware": firmware,
        "assembly_steps": assembly_steps
    }

if __name__ == "__main__":
    try:
        test_prompt = "Say hello in one sentence."
        print("Connecting to Snowflake...")
        response = call_cortex(test_prompt)
        print("LLM response:", response)
    except Exception as e:
        print(f"Error: {e}")
        print("\nTroubleshooting:")
        print(f"  Account: {os.getenv('SNOWFLAKE_ACCOUNT')}")
        print(f"  User: {os.getenv('SNOWFLAKE_USER')}")
        print(f"  Warehouse: {os.getenv('SNOWFLAKE_WAREHOUSE')}")
        print(f"  Database: {os.getenv('SNOWFLAKE_DATABASE')}")
