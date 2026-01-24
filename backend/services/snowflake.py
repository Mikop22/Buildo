def generate_code_and_steps(spec: dict) -> dict:
    return {
        "firmware": """// ESP32 Smart Plant Waterer
#include <Arduino.h>
void setup() {
    // init code
}
void loop() {
    // main code
}
""",
        "assembly_steps": [
            "Connect moisture sensor to ESP32",
            "Connect temperature sensor to ESP32",
            "Wire water pump to control pin",
            "Upload firmware to ESP32"
        ]
    }
