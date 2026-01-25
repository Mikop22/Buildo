"use client";

import { useProject } from "@/app/context/ProjectContext";

export default function Blueprints() {
    const { projectData } = useProject();
    const imageUrl = projectData?.assembledProductImage;
    const description = projectData?.description || "High-Performance Project";
    
    // Get list of parts used in the assembly
    const partsList = projectData?.parts?.assembled_product_image?.parts || [];

    return (
        <div className="nes-container is-rounded is-dark">
            <p>SYSTEM SCHEMATIC</p>
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
            <div style={{ marginTop: "1rem" }}>
                <p>Project: {description}</p>
                {partsList.length > 0 && (
                    <div style={{ marginTop: "0.5rem" }}>
                        <p style={{ fontSize: "0.9rem", color: "#aaa", marginBottom: "0.5rem" }}>Parts used:</p>
                        <ul style={{ fontSize: "0.8rem", color: "#888", listStyle: "none", padding: 0 }}>
                            {partsList.slice(0, 5).map((part, index) => (
                                <li key={index} style={{ marginBottom: "0.25rem" }}>
                                    • {part.title} ({part.category}{part.subcategory ? ` - ${part.subcategory}` : ''})
                                </li>
                            ))}
                            {partsList.length > 5 && (
                                <li style={{ color: "#666" }}>...and {partsList.length - 5} more</li>
                            )}
                        </ul>
                    </div>
                )}
                <p style={{ fontSize: "0.8rem", color: "#aaa", marginTop: "0.5rem" }}>Version 1.0.0</p>
            </div>
        </div>
    );
}
