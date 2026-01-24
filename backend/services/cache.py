import hashlib

_cache = {}

def _hash_description(description: str) -> str:
    return hashlib.sha256(description.encode()).hexdigest()

def get_cached(description: str):
    key = _hash_description(description)
    return _cache.get(key)

def save_cached(description: str, result: dict):
    key = _hash_description(description)
    _cache[key] = result
