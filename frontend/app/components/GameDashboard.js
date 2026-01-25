"use client";

import { useState } from "react";
import Inventory from "./Inventory";
import Blueprints from "./Blueprints";
import Assembly from "./Assembly";

export default function GameDashboard({ projectName }) {
    const [activeTab, setActiveTab] = useState("inventory");

    return (
        <div className="nes-container is-dark with-title">
            <p className="title">{projectName ? projectName.toUpperCase() : "PROJECT DASHBOARD"}</p>

            {/* Tab Navigation */}
            <div style={{ marginBottom: "2rem" }}>
                <button
                    type="button"
                    className={`nes-btn ${activeTab === "inventory" ? "is-primary" : ""}`}
                    onClick={() => setActiveTab("inventory")}
                    style={{ marginRight: "1rem" }}
                >
                    INVENTORY
                </button>
                <button
                    type="button"
                    className={`nes-btn ${activeTab === "blueprints" ? "is-primary" : ""}`}
                    onClick={() => setActiveTab("blueprints")}
                    style={{ marginRight: "1rem" }}
                >
                    BLUEPRINTS
                </button>
                <button
                    type="button"
                    className={`nes-btn ${activeTab === "assembly" ? "is-primary" : ""}`}
                    onClick={() => setActiveTab("assembly")}
                >
                    ASSEMBLY
                </button>
            </div>

            {/* Content Area */}
            <div className="dashboard-content">
                {activeTab === "inventory" && <Inventory />}
                {activeTab === "blueprints" && <Blueprints />}
                {activeTab === "assembly" && <Assembly />}
            </div>
        </div>
    );
}
