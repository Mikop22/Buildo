"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import GameDashboard from "../../components/GameDashboard";
import PixelBackground from "../../components/PixelBackground";

export default function BuildPage() {
    const params = useParams();
    const projectId = params.id;
    const [projectName, setProjectName] = useState("");

    useEffect(() => {
        // Find the project name from localStorage
        const savedProjects = JSON.parse(localStorage.getItem("savedProjects") || "[]");
        const project = savedProjects.find(p => p.id === projectId);

        if (project) {
            setProjectName(project.name);
        } else {
            // Fallback: convert ID back to readable name
            setProjectName(
                projectId
                    .split("-")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")
            );
        }
    }, [projectId]);

    return (
        <>
            <PixelBackground variant="tech" />
            <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                <GameDashboard projectName={projectName} />
            </div>
        </>
    );
}
