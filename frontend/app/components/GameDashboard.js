"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Inventory from "./Inventory";
import Blueprints from "./Blueprints";
import Code from "./Code";
import Assembly from "./Assembly";

export default function GameDashboard({ projectName }) {
    const [activeTab, setActiveTab] = useState("blueprints");
    const router = useRouter();

    const handleGenerateBuild = () => {
        router.push("/final-build");
    };

    return (
        <div className="nes-container is-dark with-title">
            <p className="title">{projectName ? projectName.toUpperCase() : "PROJECT DASHBOARD"}</p>

            {/* Tab Navigation */}
            <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                    <button
                        type="button"
                        className={`nes-btn ${activeTab === "blueprints" ? "is-primary" : ""}`}
                        onClick={() => setActiveTab("blueprints")}
                    >
                        VISUALIZE
                    </button>
                    <button
                        type="button"
                        className={`nes-btn ${activeTab === "inventory" ? "is-primary" : ""}`}
                        onClick={() => setActiveTab("inventory")}
                    >
                        SHOP PARTS
                    </button>
                    <button
                        type="button"
                        className={`nes-btn ${activeTab === "code" ? "is-primary" : ""}`}
                        onClick={() => setActiveTab("code")}
                    >
                        CODE
                    </button>
                    <button
                        type="button"
                        className={`nes-btn ${activeTab === "assembly" ? "is-primary" : ""}`}
                        onClick={() => setActiveTab("assembly")}
                    >
                        ASSEMBLY
                    </button>
                </div>
                <button
                    type="button"
                    className="nes-btn is-success"
                    onClick={handleGenerateBuild}
                    style={{ marginLeft: "auto", marginRight: "0.5rem" }}
                >
                    GENERATE BUILD
                </button>
            </div>

            {/* Content Area */}
            <div className="dashboard-content">
                {activeTab === "blueprints" && <Blueprints />}
                {activeTab === "inventory" && <Inventory />}
                {activeTab === "code" && <Code />}
                {activeTab === "assembly" && <Assembly />}
            </div>
        </div>
    );
}
