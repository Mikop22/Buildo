import json
from services.gemini import fetch_parts_by_category
from services.snowflake import generate_code_and_steps

def test_parts_only(description):
    """Test option 1: Generate parts only using Gemini"""
    print("\n" + "="*60)
    print("Testing Parts Generation (Gemini)")
    print("="*60)
    try:
        result = fetch_parts_by_category(description)
        print("\nGemini + Catalog Response:\n")
        print(json.dumps(result, indent=2))
        return result
    except Exception as e:
        print(f"Error: {e}\n")
        return None

def test_parts_and_instructions(description):
    """Test option 2: Generate parts using Gemini, then instructions using Snowflake"""
    print("\n" + "="*60)
    print("Testing Parts Generation (Gemini)")
    print("="*60)
    try:
        parts_by_category = fetch_parts_by_category(description)
        print("\nGemini + Catalog Response:\n")
        print(json.dumps(parts_by_category, indent=2))
        
        print("\n" + "="*60)
        print("Generating Assembly Instructions (Snowflake)")
        print("="*60)
        
        code_steps = generate_code_and_steps(parts_by_category)
        
        print("\n" + "="*60)
        print("Assembly Steps (JSON format):\n")
        print(json.dumps(code_steps["assembly_steps"], indent=2))
        
        return {
            "parts": parts_by_category,
            "assembly_steps": code_steps["assembly_steps"]
        }
    except Exception as e:
        print(f"Error: {e}\n")
        import traceback
        traceback.print_exc()
        return None

def main():
    print("="*60)
    print("Hardware Assembly Test Suite")
    print("="*60)
    print("\nSelect test option:")
    print("(1) Test parts generation only (Gemini)")
    print("(2) Test parts + instructions (Gemini → Snowflake)")
    print("\nEnter 'quit' or 'q' to exit at any time")
    
    while True:
        choice = input("\nEnter your choice (1 or 2): ").strip()
        
        if choice.lower() in {"quit", "exit", "q"}:
            print("Exiting...")
            break
        
        if choice not in {"1", "2"}:
            print("Invalid choice. Please enter 1 or 2.")
            continue
        
        description = input("\nEnter your device description: ").strip()
        
        if description.lower() in {"quit", "exit", "q"}:
            print("Exiting...")
            break
        
        if not description:
            print("Description cannot be empty. Please try again.")
            continue
        
        if choice == "1":
            test_parts_only(description)
        elif choice == "2":
            test_parts_and_instructions(description)
        
        print("\n" + "="*60)
        continue_choice = input("\nTest again? (y/n): ").strip().lower()
        if continue_choice not in {"y", "yes"}:
            break

if __name__ == "__main__":
    main()
