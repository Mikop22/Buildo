def generate_parts_and_spec(description: str) -> dict:
    return {
        "device_spec": {
            "name": "Smart Plant Waterer",
            "sensors": ["moisture sensor", "temperature sensor"],
            "actuators": ["water pump"],
            "microcontroller": "ESP32"
        },
        "parts_list": [
            {"part": "ESP32", "qty": 1},
            {"part": "Soil Moisture Sensor", "qty": 1},
            {"part": "Temperature Sensor", "qty": 1},
            {"part": "Water Pump", "qty": 1}
        ]
    }
