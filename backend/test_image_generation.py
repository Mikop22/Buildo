"""
Test script for image generation feature

Tests the /generate endpoint to verify image generation works.
Saves the assembled product image showing all parts put together.
"""
import requests
import json
import base64
import os
import sys

# Add backend directory to path to import services
sys.path.insert(0, os.path.dirname(__file__))

def test_generate_endpoint():
    """Test the /generate endpoint with image generation"""
    url = "http://localhost:5000/generate"
    
    # Test with a simple device description
    data = {
        "description": "advanced super robot that destroys bed bugs"
    }
    
    print("Testing /generate endpoint with image generation...")
    print(f"Request: {json.dumps(data, indent=2)}\n")
    
    try:
        response = requests.post(url, json=data, timeout=60)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            # Create test/images directory if it doesn't exist
            script_dir = os.path.dirname(__file__)
            images_dir = os.path.join(script_dir, "test", "images")
            os.makedirs(images_dir, exist_ok=True)
            
            # Collect all parts from all categories
            all_parts = []
            device_description = data.get("description", "")
            
            print("\n📦 Collecting all parts...")
            for category, parts in result.items():
                if category not in ["firmware", "assembly_steps", "assembled_product_image"]:
                    if parts:
                        print(f"  {category}: {len(parts)} part(s)")
                        for part in parts:
                            if isinstance(part, dict):
                                part_title = part.get('title', 'Unknown')
                            else:
                                part_title = str(part)
                            print(f"    - {part_title}")
                            all_parts.append({
                                "title": part_title,
                                "category": category
                            })
            
            # Check for assembled product image
            if "assembled_product_image" in result:
                assembled_data = result["assembled_product_image"]
                image_url = assembled_data.get("imageUrl")
                
                if image_url:
                    print(f"\n🎨 Saving assembled product image...")
                    try:
                        # Extract base64 data from data URL
                        if image_url.startswith('data:image'):
                            base64_data = image_url.split(',')[1]
                        else:
                            base64_data = image_url
                        
                        # Decode base64 to binary
                        image_bytes = base64.b64decode(base64_data)
                        
                        # Create sanitized filename
                        device_name = device_description.replace(' ', '_') if device_description else "product"
                        image_filename = f"assembled_{device_name}.png"
                        image_filename = "".join(c for c in image_filename if c.isalnum() or c in ('_', '-', '.'))  # Sanitize filename
                        image_path = os.path.join(images_dir, image_filename)
                        
                        # Save image
                        with open(image_path, 'wb') as f:
                            f.write(image_bytes)
                        
                        print(f"  ✅ Assembled product image saved to: {image_path}")
                        
                        # Show parts used in assembly
                        parts_list = assembled_data.get("parts", [])
                        if parts_list:
                            print(f"\n📋 Parts included in assembly ({len(parts_list)} total):")
                            for part_info in parts_list:
                                print(f"  - {part_info.get('category', 'unknown')}: {part_info.get('title', 'Unknown')}")
                        
                    except Exception as e:
                        print(f"  ❌ Error saving assembled product image: {str(e)}")
                else:
                    print("\n⚠️  Assembled product image URL not found in response")
            else:
                print("\n⚠️  No assembled product image found in response")
            
            # Save full response to file for inspection
            with open("test_response.json", "w") as f:
                json.dump(result, f, indent=2)
            print("\n✅ Full response saved to test_response.json")
            
        else:
            print(f"\n❌ Error: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to backend. Make sure the Flask server is running on port 5000.")
    except requests.exceptions.Timeout:
        print("❌ Error: Request timed out. Image generation may take a while.")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_generate_endpoint()
