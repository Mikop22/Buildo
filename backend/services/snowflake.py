import os
import json
import snowflake.connector
from dotenv import load_dotenv
from llm_config import SNOWFLAKE_CONFIG

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
    print(f"[Snowflake] Calling Cortex API (prompt length: {len(prompt)} chars)...")
    try:
        conn = get_snowflake_conn()
        cur = conn.cursor()
        
        escaped_prompt = prompt.replace("'", "''")
        
        cur.execute(f"""
            SELECT SNOWFLAKE.CORTEX.COMPLETE(
                '{SNOWFLAKE_CONFIG["model"]}',
                '{escaped_prompt}'
            )
        """)
        
        print("[Snowflake] Waiting for response...")
        result = cur.fetchone()
        cur.close()
        conn.close()
        
        response = result[0] if result else None
        if response:
            print(f"[Snowflake] Received response ({len(response)} chars)")
        else:
            print("[Snowflake] No response received")
        return response
    except Exception as e:
        print(f"[Snowflake] Error calling Cortex: {e}")
        import traceback
        traceback.print_exc()
        raise

def generate_code_and_steps(parts_by_category: dict) -> dict:
    parts_json = json.dumps(parts_by_category, indent=2)
    
    INSTRUCTIONS_TEMPLATES_PATH = os.path.join(os.path.dirname(__file__), "..", "templates", "snowflake", "instructions")
    
    with open(os.path.join(INSTRUCTIONS_TEMPLATES_PATH, "system_prompt.txt"), "r", encoding="utf-8") as f:
        system_prompt = f.read()
    with open(os.path.join(INSTRUCTIONS_TEMPLATES_PATH, "user_prompt.txt"), "r", encoding="utf-8") as f:
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

def generate_skeleton_code(parts_by_category: dict, description: str, assembly_steps: list) -> str:
    """
    Generate skeleton code for the device based on parts, description, and assembly instructions.
    
    Args:
        parts_by_category: Dictionary with nested structure containing matched parts
        description: User's device description
        assembly_steps: List of assembly instruction strings
        
    Returns:
        Skeleton code as a string, or None if generation fails
    """
    print(f"[Code Generation] Building prompt for code generation...")
    parts_json = json.dumps(parts_by_category, indent=2)
    assembly_steps_text = "\n".join([f"{i+1}. {step}" for i, step in enumerate(assembly_steps)])
    
    CODE_TEMPLATES_PATH = os.path.join(os.path.dirname(__file__), "..", "templates", "snowflake", "code")
    
    with open(os.path.join(CODE_TEMPLATES_PATH, "system_prompt.txt"), "r", encoding="utf-8") as f:
        system_prompt = f.read()
    with open(os.path.join(CODE_TEMPLATES_PATH, "user_prompt.txt"), "r", encoding="utf-8") as f:
        user_prompt_template = f.read()
    
    user_prompt = user_prompt_template.format(
        description=description,
        parts_json=parts_json,
        assembly_steps=assembly_steps_text
    )
    
    full_prompt = f"{system_prompt}\n\n{user_prompt}"
    print(f"[Code Generation] Prompt ready ({len(full_prompt)} chars), calling Snowflake Cortex...")
    
    code_response = call_cortex(full_prompt)
    
    if not code_response:
        return None
    
    # Check if response indicates no code needed
    response_lower = code_response.lower().strip()
    if "no code required" in response_lower or "no code needed" in response_lower or response_lower == "":
        return None
    
    # Extract code from markdown code blocks if present
    if "```" in code_response:
        # Handle multiple code blocks
        blocks = []
        lines = code_response.split("\n")
        current_block = []
        in_code_block = False
        
        for line in lines:
            if line.strip().startswith("```"):
                if in_code_block:
                    # End of code block - save it
                    if current_block:
                        blocks.append("\n".join(current_block))
                        current_block = []
                in_code_block = not in_code_block
                continue
            if in_code_block:
                current_block.append(line)
        
        # Add final block if any
        if current_block:
            blocks.append("\n".join(current_block))
        
        # Join multiple blocks with double newline, or return single block
        if blocks:
            return "\n\n".join(blocks) if len(blocks) > 1 else blocks[0]
        return code_response
    
    return code_response

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
