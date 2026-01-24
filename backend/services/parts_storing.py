import json
import os

_PARTS_DB = None
_INDEX = None

def load():
    global _PARTS_DB, _INDEX
    if _PARTS_DB is not None:
        return _PARTS_DB
    
    results_path = os.path.join(os.path.dirname(__file__), "..", "results.json")
    with open(results_path, "r", encoding="utf-8") as f:
        _PARTS_DB = json.load(f)
    
    _INDEX = {}
    for part in _PARTS_DB:
        cat = part.get("category")
        subcat = part.get("subcategory")
        if cat not in _INDEX:
            _INDEX[cat] = {}
        if subcat not in _INDEX[cat]:
            _INDEX[cat][subcat] = []
        _INDEX[cat][subcat].append(part)
    
    return _PARTS_DB

def get_all():
    if _PARTS_DB is None:
        return load()
    return _PARTS_DB

def get_by_cat_subcat(category, subcategory):
    if _INDEX is None:
        load()
    return _INDEX.get(category, {}).get(subcategory, [])
