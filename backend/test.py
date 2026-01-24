import json
from services.gemini import fetch_parts_by_category

def main():
    while True:
        description = input("Enter your device description (or 'quit' to exit): ")
        if description.strip().lower() in {"quit", "exit", "q"}:
            break
        try:
            result = fetch_parts_by_category(description)
            print("\nGemini + Catalog Response:\n")
            print(json.dumps(result, indent=2))
        except Exception as e:
            print(f"Error: {e}\n")

if __name__ == "__main__":
    main()
