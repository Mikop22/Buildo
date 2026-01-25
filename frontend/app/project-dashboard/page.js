"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import GameDashboard from "../components/GameDashboard";

function ProjectContent() {
    const searchParams = useSearchParams();
    const projectName = searchParams.get("name") || "Untitled Project";

    useEffect(() => {
        // Save project to local storage
        const savedProjects = JSON.parse(localStorage.getItem("savedProjects") || "[]");

        // Check if project already exists to avoid duplicates (simple check by name for now)
        const exists = savedProjects.some(p => p.name === projectName);

        if (!exists && projectName !== "Untitled Project") {
            const newProject = {
                id: Date.now(),
                name: projectName,
                date: new Date().toLocaleDateString(),
                status: "In Progress"
            };
            const updatedProjects = [newProject, ...savedProjects];
            localStorage.setItem("savedProjects", JSON.stringify(updatedProjects));
            // Force storage event for other tabs/components
            window.dispatchEvent(new Event("storage"));
        }
    }, [projectName]);

    return (
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            <GameDashboard projectName={projectName} />
        </div>
    );
}

export default function ProjectPage() {
    return (
        <Suspense fallback={<div className="nes-text is-warning">Loading Project...</div>}>
            <ProjectContent />
        </Suspense>
    );
}
