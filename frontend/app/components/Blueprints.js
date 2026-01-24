"use client";

export default function Blueprints() {
    return (
        <div className="nes-container is-rounded is-dark">
            <p>SYSTEM SCHEMATIC</p>
            <div style={{
                width: "100%",
                height: "400px",
                background: "#000",
                border: "4px solid #fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column"
            }}>
                <i className="nes-icon is-large trophy"></i>
                <p style={{ marginTop: "1rem", color: "#555" }}>GENERATING SCHEMATIC...</p>
                <p style={{ fontSize: "0.8rem", color: "#555" }}>(Placeholder for Torrey's Image)</p>
            </div>
            <div style={{ marginTop: "1rem" }}>
                <p>Project Structure: High-Performance Servo Controller</p>
                <p style={{ fontSize: "0.8rem", color: "#aaa" }}>Version 1.0.0</p>
            </div>
        </div>
    );
}
