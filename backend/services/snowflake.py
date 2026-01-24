def generate_code_and_steps(parts_by_category: dict) -> dict:
    # Dummy firmware scaffold using controller (if present)
    controller = parts_by_category.get("controller", [])
    controller_name = controller[0]["title"] if controller else "Microcontroller"
    firmware = f"""// Firmware scaffold for {controller_name}\n#include <Arduino.h>\nvoid setup() {{\n    // Initialize hardware\n}}\nvoid loop() {{\n    // Main logic\n}}\n"""
    # Dummy steps using categories
    steps = []
    if parts_by_category.get("inputs"):
        steps.append("Connect all input sensors to the controller.")
    if parts_by_category.get("outputs"):
        steps.append("Connect all output devices to the controller.")
    if parts_by_category.get("power"):
        steps.append("Connect power supply to the controller and peripherals.")
    if parts_by_category.get("communication"):
        steps.append("Set up communication modules as needed.")
    if parts_by_category.get("interconnect"):
        steps.append("Wire everything together using jumper wires or connectors.")
    if parts_by_category.get("mechanical"):
        steps.append("Assemble components into the enclosure.")
    steps.append(f"Upload firmware to the {controller_name}.")
    return {
        "firmware": firmware,
        "assembly_steps": steps
    }
