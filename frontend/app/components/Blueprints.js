"use client";

import { useProject } from "@/app/context/ProjectContext";

export default function Blueprints() {
    const { projectData } = useProject();
    const imageUrl = projectData?.assembledProductImage;
    const description = projectData?.description || "High-Performance Project";

    return (
        <div className="nes-container is-rounded is-dark">
            <p>PROJECT: {description.toUpperCase()}</p>
            <div style={{
                width: "100%",
                minHeight: "400px",
                background: "#000",
                border: "4px solid #fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                padding: "1rem"
            }}>
                {imageUrl ? (
                    <img 
                        src={imageUrl} 
                        alt="Assembled Product Schematic" 
                        style={{ 
                            maxWidth: "100%", 
                            maxHeight: "500px",
                            objectFit: "contain",
                            borderRadius: "4px"
                        }} 
                    />
                ) : (
                    <>
                        <i className="nes-icon is-large trophy"></i>
                        <p style={{ marginTop: "1rem", color: "#555" }}>GENERATING SCHEMATIC...</p>
                        <p style={{ fontSize: "0.8rem", color: "#555" }}>(Assembled product image will appear here)</p>
                    </>
                )}
            </div>
        </div>
    );
}
