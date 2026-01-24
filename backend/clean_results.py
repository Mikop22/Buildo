import json

with open("results.json", "r", encoding="utf-8") as f:
    data = json.load(f)

filtered = [part for part in data if part.get("price") is not None and part.get("rating") is not None]

print(f"Original: {len(data)} parts")
print(f"After filtering: {len(filtered)} parts")
print(f"Removed: {len(data) - len(filtered)} parts")

with open("results.json", "w", encoding="utf-8") as f:
    json.dump(filtered, f, indent=2, ensure_ascii=False)

print("Done! results.json updated.")
