"""
Test script for assembled product image generation

Calls the actual API to get parts, then generates an assembled product image
showing all those parts put together. This tests the full flow:
1. Get parts from API (fetch_parts_by_category)
2. Generate assembled image from those real parts
"""
import json
import base64
import os
import sys

# Add backend directory to path to import services
sys.path.insert(0, os.path.dirname(__file__))
from services.gemini import fetch_parts_by_category
from services.image_generator import generate_assembled_product_image

def test_assembled_image_from_parts():
    """Test generating assembled product image from real parts fetched from API"""
    
    # Device description to test with
    device_description = "solar powered plant watering system"
    
    print("=" * 60)
    print("Testing Assembled Product Image Generation")
    print("=" * 60)
    print(f"\nDevice: {device_description}")
    print("\nStep 1: Fetching parts from API...")
    print("-" * 60)
    
    # Get real parts from the API (same as app.py does)
    try:
        parts_by_category = fetch_parts_by_category(device_description)
        print("[OK] Successfully fetched parts from API!")
    except Exception as e:
        print(f"[ERROR] Error fetching parts: {str(e)}")
        return
    
    print("=" * 60)
    print("Testing Assembled Product Image Generation")
    print("=" * 60)
    
    # Count total parts (handling nested structure)
    total_parts = 0
    for category, subcategories in parts_by_category.items():
        if category not in ["firmware", "assembly_steps"]:
            if isinstance(subcategories, dict):
                for subcategory, parts in subcategories.items():
                    total_parts += len(parts) if parts else 0
            elif isinstance(subcategories, list):
                total_parts += len(subcategories)
    
    print(f"\nStep 2: Parts fetched ({total_parts} total):")
    print("-" * 60)
    
    for category, subcategories in parts_by_category.items():
        if category not in ["firmware", "assembly_steps"]:
            if not subcategories:
                continue
            
            # Handle nested structure
            if isinstance(subcategories, dict):
                print(f"\n  {category.upper()}:")
                for subcategory, parts in subcategories.items():
                    if parts:
                        print(f"    {subcategory}:")
                        for part in parts:
                            if isinstance(part, dict):
                                part_title = part.get('title') or part.get('name', 'Unknown')
                                part_desc = part.get('description', '')
                                if part_desc:
                                    print(f"      - {part_title} ({part_desc})")
                                else:
                                    print(f"      - {part_title}")
                            else:
                                print(f"      - {part}")
            # Handle flat structure (legacy support)
            elif isinstance(subcategories, list):
                print(f"\n  {category.upper()}:")
                for part in subcategories:
                    if isinstance(part, dict):
                        part_title = part.get('title') or part.get('name', 'Unknown')
                        part_desc = part.get('description', '')
                        if part_desc:
                            print(f"    - {part_title} ({part_desc})")
                        else:
                            print(f"    - {part_title}")
                    else:
                        print(f"    - {part}")
    
    print("\n" + "=" * 60)
    print("Step 3: Generating assembled product image from these parts...")
    print("=" * 60)
    
    # Generate the assembled product image
    image_url = generate_assembled_product_image(parts_by_category, device_description)
    
    if image_url:
        # Create test/images directory if it doesn't exist
        script_dir = os.path.dirname(__file__)
        images_dir = os.path.join(script_dir, "test", "images")
        os.makedirs(images_dir, exist_ok=True)
        
        try:
            # Extract base64 data from data URL
            if image_url.startswith('data:image'):
                base64_data = image_url.split(',')[1]
            else:
                base64_data = image_url
            
            # Decode base64 to binary
            image_bytes = base64.b64decode(base64_data)
            
            # Create sanitized filename
            device_name = device_description.replace(' ', '_')
            image_filename = f"assembled_test_{device_name}.png"
            image_filename = "".join(c for c in image_filename if c.isalnum() or c in ('_', '-', '.'))
            image_path = os.path.join(images_dir, image_filename)
            
            # Save image
            with open(image_path, 'wb') as f:
                f.write(image_bytes)
            
            print(f"\n[SUCCESS]")
            print(f"   Assembled product image saved to: {image_path}")
            print(f"   You can open this file in any image viewer!")
            print(f"\n   The image shows all {total_parts} parts")
            print(f"   (fetched from API) assembled together into a complete device.")
            
        except Exception as e:
            print(f"\n[ERROR] Error saving image: {str(e)}")
    else:
        print("\n[ERROR] Failed to generate assembled product image")
        print("   Check the console output above for error messages")

if __name__ == "__main__":
    test_assembled_image_from_parts()
