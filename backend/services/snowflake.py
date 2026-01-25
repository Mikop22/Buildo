import os
import json
import snowflake.connector
from dotenv import load_dotenv

load_dotenv()

def get_snowflake_conn():
    return snowflake.connector.connect(
        user=os.getenv('SNOWFLAKE_USER'),
        password=os.getenv('SNOWFLAKE_PASSWORD'),
        account="YG65395.ca-central-1.aws",
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
    
    assembly_task = "Generate step-by-step PHYSICAL ASSEMBLY instructions for putting together this device using these parts:"
    
    assembly_user = user_prompt_template.format(
        task_description=assembly_task,
        parts_json=parts_json
    )
    assembly_prompt = f"{system_prompt}\n\n{assembly_user}"
    
    assembly_response = call_cortex(assembly_prompt) or "[]"
    try:
        assembly_steps = json.loads(assembly_response)
        if not isinstance(assembly_steps, list):
            assembly_steps = [assembly_steps]
    except:
        assembly_steps = ["Error generating assembly steps"]
    
    return {
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
