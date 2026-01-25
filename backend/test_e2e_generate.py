"""End-to-end test for /generate with step-by-step image generation.

Run:
  1. Start backend: python3 backend/app.py (port 5000)
  2. Start assembly-images-service: python3 backend/assembly-images-service/app.py (port 5001)
  3. Run test: python3 backend/test_e2e_generate.py

Expected output:
  - Terminal logs for request, response summary, and saved files.
  - Images written to backend/assembly-images-service/testimages/:
    - assembled_product.png
    - step_1.png, step_2.png, etc.
"""

import base64
import json
import os
import time
from typing import Dict, List, Optional, Tuple

import requests


BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:5000")
ASSEMBLY_IMAGES_URL = os.environ.get("ASSEMBLY_IMAGES_URL", "http://localhost:5001")
PROMPT = "A CO2 sensor for my room"
OUTPUT_DIR = os.path.join(
    os.path.dirname(__file__),
    "assembly-images-service",
    "testimages",
)


def _strip_data_url(data: str) -> str:
    if data.startswith("data:image"):
        return data.split(",", 1)[1]
    return data


def _download_image_as_base64(url: str, timeout: int = 30) -> Optional[Tuple[str, str]]:
    """Download an image URL and return (base64_data, mime_type) or None on failure."""
    try:
        resp = requests.get(url, timeout=timeout)
        if resp.status_code != 200:
            print(f"Failed to download image (status {resp.status_code}): {url}")
            return None
        content_type = resp.headers.get("Content-Type", "image/jpeg")
        # Normalize mime type
        if "jpeg" in content_type or "jpg" in content_type:
            mime_type = "image/jpeg"
        elif "png" in content_type:
            mime_type = "image/png"
        elif "webp" in content_type:
            mime_type = "image/webp"
        elif "avif" in content_type:
            mime_type = "image/avif"
        else:
            mime_type = "image/jpeg"  # default fallback
        b64_data = base64.b64encode(resp.content).decode("utf-8")
        return (b64_data, mime_type)
    except Exception as e:
        print(f"Error downloading image {url}: {e}")
        return None


def _save_base64_png(b64_data: str, file_path: str) -> bool:
    if b64_data.startswith("http://") or b64_data.startswith("https://"):
        print("Skipping non-base64 image URL:", b64_data)
        return False
    try:
        raw = base64.b64decode(_strip_data_url(b64_data), validate=True)
    except (ValueError, base64.binascii.Error):
        print("Skipping invalid base64 image data for:", file_path)
        return False
    with open(file_path, "wb") as f:
        f.write(raw)
    return True


def _count_parts(parts_by_category: Dict) -> Dict[str, Dict[str, int]]:
    counts: Dict[str, Dict[str, int]] = {}
    for category, subcategories in parts_by_category.items():
        if category in ["assembly_steps", "assembled_product_image"]:
            continue
        if not subcategories:
            continue
        if isinstance(subcategories, dict):
            counts[category] = {}
            for subcategory, parts in subcategories.items():
                if not parts:
                    continue
                counts[category][subcategory] = len(parts)
        elif isinstance(subcategories, list):
            counts[category] = {"_flat": len(subcategories)}
    return counts


def _extract_part_images(parts_by_category: Dict) -> List[Tuple[str, str]]:
    """Return list of (filename, base64_data_url_or_raw)."""
    images: List[Tuple[str, str]] = []
    for category, subcategories in parts_by_category.items():
        if category in ["assembly_steps", "assembled_product_image"]:
            continue
        if not subcategories:
            continue
        if isinstance(subcategories, dict):
            for subcategory, parts in subcategories.items():
                if not parts:
                    continue
                for idx, part in enumerate(parts, start=1):
                    if not isinstance(part, dict):
                        continue
                    image_data = part.get("generated_image") or part.get("imageUrl") or part.get("image_url")
                    if image_data:
                        filename = f"part_{category}_{subcategory}_{idx}.png"
                        images.append((filename, image_data))
        elif isinstance(subcategories, list):
            for idx, part in enumerate(subcategories, start=1):
                if not isinstance(part, dict):
                    continue
                image_data = part.get("generated_image") or part.get("imageUrl") or part.get("image_url")
                if image_data:
                    filename = f"part_{category}_{idx}.png"
                    images.append((filename, image_data))
    return images


def _extract_parts_with_urls(parts_by_category: Dict) -> List[Dict]:
    """Extract parts with their names and image URLs for reference images."""
    parts_info: List[Dict] = []
    for category, subcategories in parts_by_category.items():
        if category in ["assembly_steps", "assembled_product_image"]:
            continue
        if not subcategories:
            continue
        if isinstance(subcategories, dict):
            for subcategory, parts in subcategories.items():
                if not parts:
                    continue
                for part in parts:
                    if not isinstance(part, dict):
                        continue
                    name = part.get("name") or part.get("title") or f"{category}_{subcategory}"
                    image_url = part.get("image_url") or part.get("imageUrl") or part.get("generated_image")
                    if image_url and image_url.startswith("http"):
                        parts_info.append({
                            "name": name,
                            "category": category,
                            "subcategory": subcategory,
                            "image_url": image_url
                        })
        elif isinstance(subcategories, list):
            for part in subcategories:
                if not isinstance(part, dict):
                    continue
                name = part.get("name") or part.get("title") or category
                image_url = part.get("image_url") or part.get("imageUrl") or part.get("generated_image")
                if image_url and image_url.startswith("http"):
                    parts_info.append({
                        "name": name,
                        "category": category,
                        "image_url": image_url
                    })
    return parts_info


def _extract_module_names(parts_by_category: Dict) -> List[str]:
    """Extract module/part names for the scene.modules field."""
    modules: List[str] = []
    for category, subcategories in parts_by_category.items():
        if category in ["assembly_steps", "assembled_product_image"]:
            continue
        if not subcategories:
            continue
        if isinstance(subcategories, dict):
            for subcategory, parts in subcategories.items():
                if not parts:
                    continue
                for part in parts:
                    if isinstance(part, dict):
                        name = part.get("name") or part.get("title")
                        if name:
                            # Use a simplified name
                            modules.append(name.split()[0] if len(name) > 30 else name)
        elif isinstance(subcategories, list):
            for part in subcategories:
                if isinstance(part, dict):
                    name = part.get("name") or part.get("title")
                    if name:
                        modules.append(name.split()[0] if len(name) > 30 else name)
    return modules


def _build_reference_images(parts_info: List[Dict]) -> List[Dict]:
    """Download part images and build reference_images array for assembly-images-service."""
    reference_images: List[Dict] = []
    for part in parts_info:
        url = part.get("image_url")
        if not url:
            continue
        print(f"Downloading reference image for: {part.get('name', 'unknown')[:50]}...")
        result = _download_image_as_base64(url)
        if result:
            b64_data, mime_type = result
            reference_images.append({
                "label": part.get("name", "part")[:50],
                "description": f"{part.get('category', '')} - {part.get('subcategory', '')}",
                "image_b64": b64_data,
                "mime_type": mime_type
            })
    return reference_images


def _call_assembly_images_service(
    project_id: str,
    title: str,
    modules: List[str],
    reference_images: List[Dict],
    steps: List[str]
) -> Optional[Dict]:
    """Call assembly-images-service and return response."""
    # Build steps array with human_description
    steps_payload = []
    for idx, step_text in enumerate(steps, start=1):
        steps_payload.append({
            "id": idx,
            "human_description": step_text
        })

    payload = {
        "project_id": project_id,
        "title": title,
        "scene": {"modules": modules},
        "style": {
            "camera": "top_down",
            "background": "white",
            "render": "photo",
            "aspect_ratio": "16:9"
        },
        "reference_images": reference_images,
        "steps": steps_payload
    }

    print("\n=== Calling assembly-images-service ===")
    print(f"URL: {ASSEMBLY_IMAGES_URL}/v1/assembly-images")
    print(f"Steps count: {len(steps_payload)}")
    print(f"Reference images count: {len(reference_images)}")

    try:
        start = time.time()
        resp = requests.post(
            f"{ASSEMBLY_IMAGES_URL}/v1/assembly-images",
            json=payload,
            timeout=300  # 5 min timeout for multiple image generations
        )
        elapsed = time.time() - start
        print(f"Status: {resp.status_code}")
        print(f"Elapsed (s): {round(elapsed, 2)}")

        if resp.status_code != 200:
            print(f"Error response: {resp.text[:500]}")
            return None

        return resp.json()
    except requests.exceptions.Timeout:
        print("Request to assembly-images-service timed out")
        return None
    except Exception as e:
        print(f"Error calling assembly-images-service: {e}")
        return None


def _save_step_images(response: Dict) -> int:
    """Save step images from assembly-images-service response. Returns count saved."""
    images = response.get("images", [])
    saved = 0
    for img in images:
        step_num = img.get("step")
        b64_data = img.get("image_b64")
        if step_num is None or not b64_data:
            continue
        file_path = os.path.join(OUTPUT_DIR, f"step_{step_num}.png")
        if _save_base64_png(b64_data, file_path):
            print(f"Saved step {step_num} image: {file_path}")
            saved += 1
    return saved


def main() -> None:
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    payload = {"description": PROMPT}
    print("=== E2E /generate ===")
    print("Backend URL:", BACKEND_URL)
    print("Request payload:", json.dumps(payload))

    start = time.time()
    response = requests.post(f"{BACKEND_URL}/generate", json=payload, timeout=120)
    elapsed = time.time() - start

    print("Status:", response.status_code)
    print("Elapsed (s):", round(elapsed, 2))

    if response.status_code != 200:
        print("Error response:", response.text)
        raise SystemExit(1)

    data = response.json()
    print("Response keys:", list(data.keys()))

    part_counts = _count_parts(data)
    print("Parts summary:", json.dumps(part_counts, indent=2))

    steps = data.get("assembly_steps", [])
    print("Assembly steps:", len(steps))

    assembled = data.get("assembled_product_image")
    if assembled and isinstance(assembled, dict):
        image_url = assembled.get("imageUrl")
        if image_url:
            assembled_path = os.path.join(OUTPUT_DIR, "assembled_product.png")
            if _save_base64_png(image_url, assembled_path):
                print("Saved assembled product image:", assembled_path)
        else:
            print("No assembled_product_image.imageUrl found")
    else:
        print("No assembled_product_image found")

    part_images = _extract_part_images(data)
    if part_images:
        print("Part images found:", len(part_images))
        for filename, image_data in part_images:
            file_path = os.path.join(OUTPUT_DIR, filename)
            if _save_base64_png(image_data, file_path):
                print("Saved part image:", file_path)
    else:
        print("No part images found in response")

    # === Step 2: Generate step-by-step images via assembly-images-service ===
    if not steps:
        print("\nNo assembly steps found, skipping step image generation")
        return

    # Extract parts with image URLs for reference images
    parts_info = _extract_parts_with_urls(data)
    print(f"\nParts with image URLs found: {len(parts_info)}")

    # Download reference images
    reference_images = _build_reference_images(parts_info)
    print(f"Reference images downloaded: {len(reference_images)}")

    # Extract module names for scene
    modules = _extract_module_names(data)
    print(f"Modules for scene: {modules}")

    # Build project ID from prompt
    project_id = PROMPT.replace(" ", "-").lower()[:30]

    # Call assembly-images-service
    assembly_response = _call_assembly_images_service(
        project_id=project_id,
        title=PROMPT,
        modules=modules,
        reference_images=reference_images,
        steps=steps
    )

    if assembly_response:
        saved_count = _save_step_images(assembly_response)
        print(f"\n=== Summary ===")
        print(f"Step images saved: {saved_count}")
    else:
        print("\nFailed to generate step images from assembly-images-service")


if __name__ == "__main__":
    main()
