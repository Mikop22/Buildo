"use client";

export default function Assembly() {
    return (
        <div className="nes-container is-rounded is-dark">
            <p>ASSEMBLY INSTRUCTIONS</p>

            <div className="nes-container with-title is-dark" style={{ marginTop: "1rem" }}>
                <p className="title">STEP 1: POWER</p>
                <p>Connect the 5V pin from Arduino to the positive rail of the breadboard.</p>
            </div>

            <div className="nes-container with-title is-dark" style={{ marginTop: "1rem" }}>
                <p className="title">STEP 2: GROUND</p>
                <p>Connect the GND pin to the negative rail.</p>
            </div>

            <div className="nes-container with-title is-dark" style={{ marginTop: "1rem" }}>
                <p className="title">CODE</p>
                <div style={{ background: "#222", padding: "1rem", borderRadius: "4px" }}>
                    <code style={{ fontSize: "0.8rem", color: "#0f0" }}>
                        void setup() &#123;<br />
                        &nbsp;&nbsp;pinMode(LED_BUILTIN, OUTPUT);<br />
                        &#125;<br />
                        <br />
                        void loop() &#123;<br />
                        &nbsp;&nbsp;digitalWrite(LED_BUILTIN, HIGH);<br />
                        &nbsp;&nbsp;delay(1000);<br />
                        &nbsp;&nbsp;digitalWrite(LED_BUILTIN, LOW);<br />
                        &nbsp;&nbsp;delay(1000);<br />
                        &#125;
                    </code>
                </div>
            </div>
        </div>
    );
}
