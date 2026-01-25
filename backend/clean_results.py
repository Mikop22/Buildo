import json

with open("results.json", "r", encoding="utf-8") as f:
    data = json.load(f)

filtered = [
    part for part in data 
    if part.get("price") is not None 
    and part.get("rating") is not None
    and not (part.get("image_url", "").lower().endswith(".png"))
]

print(f"Original: {len(data)} parts")
print(f"After filtering: {len(filtered)} parts")
print(f"Removed: {len(data) - len(filtered)} parts")
print()

subcategory_count = {}
for part in filtered:
    cat = part.get("category", "Unknown")
    subcat = part.get("subcategory", "Unknown")
    key = f"{cat} - {subcat}"
    subcategory_count[key] = subcategory_count.get(key, 0) + 1

print("Subcategory counts:")
for key, count in sorted(subcategory_count.items()):
    print(f"  {key}: {count}")

with open("results.json", "w", encoding="utf-8") as f:
    json.dump(filtered, f, indent=2, ensure_ascii=False)

print("\nDone! results.json updated.")
