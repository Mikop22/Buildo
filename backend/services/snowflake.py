def generate_code_and_steps(parts_by_category: dict) -> dict:
    """
    Generate firmware code and assembly steps based on selected parts.
    parts_by_category structure: {category: {subcategory: [parts]}}
    """
    # Find the microcontroller
    microcontrollers = parts_by_category.get("Microcontrollers", {})
    controller_name = "Microcontroller"
    for subcat, parts in microcontrollers.items():
        if parts:
            controller_name = parts[0].get("name", "Microcontroller")
            break
    
    # Generate firmware scaffold
    firmware = f"""// Firmware scaffold for {controller_name}
#include <Arduino.h>

void setup() {{
    Serial.begin(115200);
    // Initialize hardware
}}

void loop() {{
    // Main logic
}}
"""
    
    # Generate assembly steps based on what parts are selected
    steps = []
    
    if microcontrollers:
        steps.append(f"Set up your {controller_name} development board.")
    
    sensors = parts_by_category.get("Sensors", {})
    if sensors:
        sensor_names = []
        for subcat, parts in sensors.items():
            for p in parts:
                sensor_names.append(p.get("name", "sensor"))
        steps.append(f"Connect sensors: {', '.join(sensor_names[:3])}.")
    
    actuators = parts_by_category.get("Actuators", {})
    if actuators:
        actuator_names = []
        for subcat, parts in actuators.items():
            for p in parts:
                actuator_names.append(p.get("name", "actuator"))
        steps.append(f"Connect actuators: {', '.join(actuator_names[:3])}.")
    
    displays = parts_by_category.get("Displays", {})
    if displays:
        display_names = []
        for subcat, parts in displays.items():
            for p in parts:
                display_names.append(p.get("name", "display"))
        steps.append(f"Connect display: {display_names[0] if display_names else 'display'}.")
    
    power = parts_by_category.get("Power", {})
    if power:
        steps.append("Set up power management module.")
    
    steps.append(f"Upload the firmware to your {controller_name}.")
    steps.append("Test all connections and functionality.")
    
    return {
        "firmware": firmware,
        "assembly_steps": steps
    }
