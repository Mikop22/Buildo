from services.parts_catalog import PARTS_DATA

def fetch_parts_by_category(description: str) -> dict:
    # Filler logic for demonstration: returns all example parts in every category from the catalog
    # You may change this logic later to choose only relevant categories/parts based on the description
    return {
        "controller": PARTS_DATA.get("controller", []),
        "power": PARTS_DATA.get("power", []),
        "communication": PARTS_DATA.get("communication", []),
        "inputs": PARTS_DATA.get("inputs", []),
        "outputs": PARTS_DATA.get("outputs", []),
        "interconnect": PARTS_DATA.get("interconnect", []),
        "mechanical": PARTS_DATA.get("mechanical", [])
    }
