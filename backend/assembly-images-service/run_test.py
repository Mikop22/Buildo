#!/usr/bin/env python3
"""Test script for the assembly-images API with reference images."""

import base64
import json
import requests
import sys
from pathlib import Path

BASE_URL = "http://localhost:5000"

def encode_image(path: Path) -> tuple[str, str]:
    """Read and base64-encode an image file, return (b64_data, mime_type)."""
    suffix = path.suffix.lower()
    mime_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    }
    mime_type = mime_types.get(suffix, "image/png")
    
    with open(path, "rb") as f:
        data = base64.b64encode(f.read()).decode("utf-8")
    return data, mime_type


def main():
    # Paths to test images
    testimages_dir = Path(__file__).parent / "testimages"
    arduino_img = testimages_dir / "61R1A7CuHTL.jpg"
    led_img = testimages_dir / "MFG_WP7113LSURDK.webp"

    reference_images = []

    if arduino_img.exists() and led_img.exists():
        # Encode reference images
        print("Encoding reference images...")
        arduino_b64, arduino_mime = encode_image(arduino_img)
        led_b64, led_mime = encode_image(led_img)
        print(f"  - Arduino Nano: {len(arduino_b64)} bytes (base64)")
        print(f"  - Red LED: {len(led_b64)} bytes (base64)")

        reference_images = [
            {
                "label": "arduino_nano",
                "description": "Arduino Nano microcontroller board with mini USB connector and pin headers",
                "image_b64": arduino_b64,
                "mime_type": arduino_mime,
            },
            {
                "label": "red_led",
                "description": "Red 5mm LED with two metal legs",
                "image_b64": led_b64,
                "mime_type": led_mime,
            },
        ]
    else:
        print("WARNING: testimages not found; running test without reference images.")

    # Build the request payload
    payload = {
        "project_id": "led-circuit-test",
        "title": "Simple LED Circuit with Arduino Nano",
        "reference_images": reference_images,
        "steps": [
            {
                "id": 1,
                "human_description": "Place the Arduino Nano horizontally across the center of a white solderless breadboard, straddling the center divider. The USB connector should be on the left side."
            },
            {
                "id": 2,
                "human_description": "Insert a red 5mm LED into the breadboard to the right of the Arduino. Place the longer leg (anode) in row 20 column E, and the shorter leg (cathode) in row 21 column E."
            },
            {
                "id": 3,
                "human_description": "Insert a 220 ohm resistor (with red-red-brown bands) with one leg in row 21 column A (same row as LED cathode) and the other leg in the blue ground rail on the left side."
            },
            {
                "id": 4,
                "human_description": "Connect a short orange jumper wire from Arduino digital pin D13 (on the breadboard) to row 20 column A (same row as LED anode). Connect a short black jumper wire from Arduino GND pin to the blue ground rail."
            },
        ],
    }
    
    print("\n" + "="*60)
    print("REQUEST PAYLOAD")
    print("="*60)
    # Print payload without the huge base64 strings
    display_payload = payload.copy()
    display_payload["reference_images"] = [
        {**img, "image_b64": f"<{len(img['image_b64'])} bytes>"} 
        for img in payload["reference_images"]
    ]
    print(json.dumps(display_payload, indent=2))
    
    # Send the request
    print("\n" + "="*60)
    print("SENDING REQUEST TO API...")
    print("="*60)
    print(f"POST {BASE_URL}/v1/assembly-images")
    
    try:
        response = requests.post(
            f"{BASE_URL}/v1/assembly-images",
            json=payload,
            timeout=300,  # 5 minutes timeout for image generation
        )
    except requests.exceptions.ConnectionError:
        print("\nERROR: Could not connect to the server.")
        print("Make sure the server is running with:")
        print("  GEMINI_API_KEY=<your-key> python3 app.py")
        sys.exit(1)
    
    print(f"\nResponse status: {response.status_code}")
    
    if response.status_code != 200:
        print(f"ERROR: {response.text}")
        sys.exit(1)
    
    # Parse response
    result = response.json()
    
    print("\n" + "="*60)
    print("RESPONSE")
    print("="*60)
    print(f"Project ID: {result.get('project_id')}")
    print(f"Number of images: {len(result.get('images', []))}")
    
    # Save images
    output_dir = Path(__file__).parent / "output"
    output_dir.mkdir(exist_ok=True)
    
    print("\n" + "="*60)
    print("SAVING OUTPUT IMAGES")
    print("="*60)
    
    for img_data in result.get("images", []):
        step_num = img_data["step"]
        img_bytes = base64.b64decode(img_data["image_b64"])
        output_path = output_dir / f"step_{step_num}.png"
        
        with open(output_path, "wb") as f:
            f.write(img_bytes)
        
        print(f"  Saved: {output_path} ({len(img_bytes)} bytes)")
    
    print("\n" + "="*60)
    print("TEST COMPLETE!")
    print("="*60)
    print(f"Output images saved to: {output_dir}")


if __name__ == "__main__":
    main()
