import json

# Lazy imports - only import when needed to avoid slow startup
def _import_services():
    from services.gemini import fetch_parts_by_category
    from services.snowflake import generate_code_and_steps, generate_skeleton_code
    from services.image_generator import generate_final_build_image
    return fetch_parts_by_category, generate_code_and_steps, generate_skeleton_code, generate_final_build_image

def test_parts_only(description):
    """Test option 1: Generate parts only using Gemini"""
    fetch_parts_by_category, _, _, _ = _import_services()
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
    fetch_parts_by_category, generate_code_and_steps, _, _ = _import_services()
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

def test_parts_instructions_and_code(description):
    """Test option 3: Generate parts, instructions, and skeleton code"""
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
        
        print("\n" + "="*60)
        print("Generating Skeleton Code (Snowflake Code)")
        print("="*60)
        
        skeleton_code = generate_skeleton_code(parts_by_category, description, code_steps["assembly_steps"])
        
        if skeleton_code:
            print("\n✓ Skeleton code generated:")
            print("="*60)
            print(skeleton_code)
            print("="*60)
        else:
            print("\n✗ No code generated (device may not require programming)")
        
        return {
            "parts": parts_by_category,
            "assembly_steps": code_steps["assembly_steps"],
            "skeleton_code": skeleton_code
        }
    except Exception as e:
        print(f"Error: {e}\n")
        import traceback
        traceback.print_exc()
        return None

def test_parts_instructions_and_image(description):
    """Test option 4: Generate parts, instructions, and final build image"""
    fetch_parts_by_category, generate_code_and_steps, _, generate_final_build_image = _import_services()
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
        
        print("\n" + "="*60)
        print("Generating Final Build Image (Gemini Image)")
        print("="*60)
        
        base64_image_data = generate_final_build_image(parts_by_category, description)
        
        if base64_image_data:
            print(f"\n✓ Image generated and saved to backend folder")
            print(f"  Base64 data length: {len(base64_image_data)} characters")
        else:
            print("\n✗ Failed to generate image")
        
        return {
            "parts": parts_by_category,
            "assembly_steps": code_steps["assembly_steps"],
            "image_generated": base64_image_data is not None
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
    print("(3) Test parts + instructions + code (Gemini → Snowflake → Snowflake Code)")
    print("(4) Test parts + instructions + image (Gemini → Snowflake → Gemini Image)")
    print("\nEnter 'quit' or 'q' to exit at any time")
    
    while True:
        choice = input("\nEnter your choice (1, 2, 3, or 4): ").strip()
        
        if choice.lower() in {"quit", "exit", "q"}:
            print("Exiting...")
            break
        
        if choice not in {"1", "2", "3", "4"}:
            print("Invalid choice. Please enter 1, 2, 3, or 4.")
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
        elif choice == "3":
            test_parts_instructions_and_code(description)
        elif choice == "4":
            test_parts_instructions_and_image(description)
        
        print("\n" + "="*60)
        continue_choice = input("\nTest again? (y/n): ").strip().lower()
        if continue_choice not in {"y", "yes"}:
            break

if __name__ == "__main__":
    main()
