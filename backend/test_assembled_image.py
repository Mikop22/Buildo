"""
Test script for assembled product image generation

Takes parts in the same format as system_prompt.txt and generates
an assembled product image showing all parts put together.
"""
import json
import base64
import os
import sys

# Add backend directory to path to import services
sys.path.insert(0, os.path.dirname(__file__))
from services.image_generator import generate_assembled_product_image

def test_assembled_image_from_parts():
    """Test generating assembled product image from parts"""
    
    # Example parts in the same format as system_prompt.txt output
    # You can modify these parts to test different configurations
    parts_by_category = {
    "core_systems": [
        {
            "title": "Spark Core",
            "description": "Central life-energy core that powers Optimus Prime"
        },
        {
            "title": "Cybertronian CPU",
            "description": "Advanced robotic brain for decision-making and strategy"
        }
    ],
    "power": [
        {
            "title": "Energon Power Cells",
            "description": "Primary energy source used by Cybertronians"
        },
        {
            "title": "Power Regulation Module",
            "description": "Distributes energy safely to all systems"
        }
    ],
    "mobility": [
        {
            "title": "Leg Actuator Assemblies",
            "description": "High-torque mechanical legs for walking and running"
        },
        {
            "title": "Wheel Transformation Units",
            "description": "Hidden wheels used in vehicle transformation mode"
        }
    ],
    "transformation_system": [
        {
            "title": "Transformation Gear Network",
            "description": "Mechanical system enabling robot-to-truck conversion"
        },
        {
            "title": "Adaptive Armor Plates",
            "description": "Panels that shift position during transformation"
        }
    ],
    "sensors": [
        {
            "title": "Optical Vision Sensors",
            "description": "Advanced visual sensors for targeting and navigation"
        },
        {
            "title": "Environmental Scanners",
            "description": "Detects threats, terrain, and allies"
        }
    ],
    "inputs": [
        {
            "title": "Command Interface",
            "description": "Internal control interface for conscious input"
        },
        {
            "title": "Voice Command System",
            "description": "Allows spoken communication and commands"
        }
    ],
    "outputs": [
        {
            "title": "Vocal Speaker Array",
            "description": "Produces Optimus Prime’s voice"
        },
        {
            "title": "Status Light Emitters",
            "description": "Visual indicators for system states"
        }
    ],
    "defensive_systems": [
        {
            "title": "Reinforced Armor Plating",
            "description": "Protective outer shell made from Cybertronian alloy"
        },
        {
            "title": "Energy Shield Generator",
            "description": "Defensive field that absorbs incoming damage"
        }
    ],
    "structural": [
        {
            "title": "Endoskeleton Frame",
            "description": "Internal structural support for the entire body"
        },
        {
            "title": "Hydraulic Joint Systems",
            "description": "Allows smooth and powerful limb movement"
        }
    ]
}


    device_description = "solar powered plant watering system"
    
    print("=" * 60)
    print("Testing Assembled Product Image Generation")
    print("=" * 60)
    print(f"\nDevice: {device_description}")
    print(f"\nParts to assemble ({sum(len(parts) for cat, parts in parts_by_category.items() if cat not in ['firmware', 'assembly_steps'])} total):")
    
    for category, parts in parts_by_category.items():
        if category not in ["firmware", "assembly_steps"]:
            if parts:
                print(f"\n  {category.upper()}:")
                for part in parts:
                    if isinstance(part, dict):
                        print(f"    - {part.get('title', 'Unknown')}")
                    else:
                        print(f"    - {part}")
    
    print("\n" + "=" * 60)
    print("Generating assembled product image...")
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
            
            print(f"\n✅ SUCCESS!")
            print(f"   Assembled product image saved to: {image_path}")
            print(f"   You can open this file in any image viewer!")
            print(f"\n   The image shows all {sum(len(parts) for cat, parts in parts_by_category.items() if cat not in ['firmware', 'assembly_steps'])} parts assembled together.")
            
        except Exception as e:
            print(f"\n❌ Error saving image: {str(e)}")
    else:
        print("\n❌ Failed to generate assembled product image")
        print("   Check the console output above for error messages")

if __name__ == "__main__":
    test_assembled_image_from_parts()
