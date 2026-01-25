"use client";

export default function Inventory() {
    // Mock data for parts - will be replaced by API later
    const parts = [
        { id: 1, name: "Arduino Uno R3", collected: false },
        { id: 2, name: "Servo Motor SG90", collected: false },
        { id: 3, name: "Jumper Wires (M-M)", collected: false },
        { id: 4, name: "Breadboard", collected: false },
        { id: 5, name: "LEDs (Red, Green)", collected: false },
    ];

    return (
        <div className="nes-container is-rounded is-dark">
            <p>REQUIRED PARTS</p>
            <div className="lists">
                <ul className="nes-list is-disc">
                    {parts.map((part) => (
                        <li key={part.id} style={{ marginBottom: "1rem" }}>
                            <label>
                                <input type="checkbox" className="nes-checkbox is-dark" />
                                <span>{part.name}</span>
                            </label>
                        </li>
                    ))}
                </ul>
            </div>
            <div style={{ marginTop: "2rem", textAlign: "right" }}>
                <button className="nes-btn is-success">BUY ALL PARTS</button>
            </div>
        </div>
    );
}
