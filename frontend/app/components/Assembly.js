"use client";

import { useState, useMemo } from "react";
import styles from "./Assembly.module.css";
import { useProject } from "@/app/context/ProjectContext";

// Safety warnings data
const safetyWarnings = [
    "Always wear safety glasses when working with electronics",
    "Unplug all power sources before making connections",
    "Keep the workspace away from children and pets",
    "Use proper tools and avoid short circuits",
    "Work in a well-ventilated area"
];

export default function Assembly() {
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const { projectData } = useProject();

    // Transform backend data to assembly steps format
    const assemblySteps = useMemo(() => {
        const steps = projectData?.assemblySteps || [];
        const stepImages = projectData?.stepImages || [];
        
        if (steps.length === 0) {
            // Fallback to mock data if no steps from backend
            return [
                {
                    id: 1,
                    title: "Prepare Your Workspace",
                    instructions: [
                        "Gather all required parts from your inventory",
                        "Ensure you have a clean, well-lit workspace",
                        "Keep tools organized and within reach"
                    ],
                    imageUrl: null,
                    tip: "Use a static-free mat to protect sensitive components"
                },
                {
                    id: 2,
                    title: "Connect Power Supply",
                    instructions: [
                        "Connect the 5V pin from Arduino to the positive rail of the breadboard",
                        "Double-check polarity before connecting",
                        "Verify connection with a multimeter if available"
                    ],
                    imageUrl: null,
                    tip: "Always power off before making connections"
                },
                {
                    id: 3,
                    title: "Establish Ground Connection",
                    instructions: [
                        "Connect the GND pin to the negative rail",
                        "Ensure all components share the same ground",
                        "Test continuity between ground points"
                    ],
                    imageUrl: null
                },
                {
                    id: 4,
                    title: "Install Main Components",
                    instructions: [
                        "Place Arduino Uno R3 in a secure position",
                        "Connect servo motor to designated pins",
                        "Route jumper wires neatly to avoid tangles"
                    ],
                    imageUrl: null,
                    tip: "Label your connections for easier troubleshooting"
                },
                {
                    id: 5,
                    title: "Upload Code",
                    instructions: [
                        "Open Arduino IDE and create a new sketch",
                        "Copy the provided code into the editor",
                        "Select correct board and port, then upload"
                    ],
                    imageUrl: null
                },
                {
                    id: 6,
                    title: "Test and Verify",
                    instructions: [
                        "Power on the system and observe LED indicators",
                        "Test each component individually",
                        "Verify all connections are secure"
                    ],
                    imageUrl: null,
                    tip: "Keep a log of any issues encountered during testing"
                }
            ];
        }
        
        return steps.map((stepText, index) => {
            const stepNum = index + 1;
            const stepImage = stepImages.find(img => img.step === stepNum);
            
            // Extract step title from text (e.g., "Step 1: Gather materials" -> "Gather materials")
            let title = `Step ${stepNum}`;
            let instructionText = stepText;
            
            // Remove step number prefixes from instruction text
            // Patterns: "Step 1:", "Step 1 -", "1.", "1:", etc.
            instructionText = instructionText
                .replace(/^Step\s+\d+\s*[:-]\s*/i, '') // "Step 1:" or "Step 1 -"
                .replace(/^\d+\.\s*/, '') // "1."
                .replace(/^\d+\s*[:-]\s*/, '') // "1:" or "1 -"
                .trim();
            
            const colonIndex = stepText.indexOf(':');
            if (colonIndex > -1) {
                const afterColon = stepText.substring(colonIndex + 1).trim();
                // Remove step number prefix from afterColon too
                const cleanedAfterColon = afterColon
                    .replace(/^Step\s+\d+\s*[:-]\s*/i, '')
                    .replace(/^\d+\.\s*/, '')
                    .replace(/^\d+\s*[:-]\s*/, '')
                    .trim();
                // Take first sentence or first 50 chars as title
                const firstSentence = cleanedAfterColon.split('.')[0];
                if (firstSentence.length < 60) {
                    title = firstSentence;
                    instructionText = cleanedAfterColon;
                }
            }
            
            return {
                id: stepNum,
                title: title,
                instructions: [instructionText],
                imageUrl: stepImage ? `data:image/png;base64,${stepImage.image_b64}` : null
            };
        });
    }, [projectData]);

    const toggleVideo = () => {
        setIsVideoOpen(!isVideoOpen);
    };

    const downloadSteps = () => {
        let content = "ASSEMBLY STEPS\n";
        content += "=".repeat(50) + "\n\n";
        
        assemblySteps.forEach((step, index) => {
            content += `Step ${step.id}: ${step.title}\n`;
            content += "-".repeat(50) + "\n";
            step.instructions.forEach((instruction, idx) => {
                content += `${idx + 1}. ${instruction}\n`;
            });
            if (step.tip) {
                content += `\nTIP: ${step.tip}\n`;
            }
            content += "\n";
        });

        // Create blob and download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `assembly-steps-${projectData?.description || 'project'}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className={styles.assemblyContainer}>
            {/* Video Panel Section - Pushes content down when open */}
            <div className={`${styles.videoSection} ${isVideoOpen ? styles.videoSectionOpen : ''}`}>
                {isVideoOpen && (
                    <div className={styles.videoPanel}>
                        <div className={styles.videoHeader}>
                            <h3 className={styles.videoTitle}>TUTORIAL VIDEO</h3>
                            <button
                                type="button"
                                className={`nes-btn is-error ${styles.closeVideoBtn}`}
                                onClick={toggleVideo}
                                title="Close video"
                            >
                                <i className="nes-icon close is-small"></i>
                            </button>
                        </div>
                        <div className={styles.videoContainer}>
                            {/* Placeholder video - can be replaced with actual video embed */}
                            <div className={styles.videoPlaceholder}>
                                <i className="nes-icon youtube is-large"></i>
                                <p>Tutorial video goes here</p>
                                <p className={styles.videoPlaceholderSubtext}>
                                    Embed your tutorial video or use a video URL
                                </p>
                            </div>
                            {/* Uncomment below to use actual video:
                            <video controls className={styles.video}>
                                <source src="/path/to/tutorial.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            */}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className={styles.mainContent}>
                {/* Safety Warnings */}
                <SafetyWarnings warnings={safetyWarnings} />

                {/* Assembly Steps */}
                <div className={styles.stepsContainer}>
                    <h2 className={styles.stepsTitle}>ASSEMBLY STEPS</h2>
                    <div className={styles.stepsButtons}>
                        <button
                            type="button"
                            className={`nes-btn is-primary ${styles.downloadButton}`}
                            onClick={downloadSteps}
                            title="Download assembly steps as text file"
                        >
                            <span>DOWNLOAD STEPS</span>
                        </button>
                        <button
                            type="button"
                            className={`nes-btn is-primary ${styles.tutorialButton}`}
                            onClick={toggleVideo}
                            title="Open tutorial video"
                        >
                            <i className="nes-icon youtube is-small"></i>
                            <span>TUTORIAL VIDEO</span>
                        </button>
                    </div>
                    {assemblySteps.map((step) => (
                        <StepCard key={step.id} step={step} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Safety Warnings Component
function SafetyWarnings({ warnings }) {
    return (
        <div className={`nes-container is-rounded is-dark ${styles.safetyWarnings}`}>
            <div className={styles.warningHeader}>
                <i className="nes-icon is-large warning"></i>
                <h3 className={styles.warningTitle}>SAFETY WARNINGS</h3>
            </div>
            <ul className={`nes-list is-disc ${styles.warningList}`}>
                {warnings.map((warning, index) => (
                    <li key={index} className={styles.warningItem}>
                        {warning}
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Step Card Component
function StepCard({ step }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
        <div className={`nes-container is-rounded is-dark ${styles.stepCard}`}>
            <div className={styles.stepHeader}>
                <div className={styles.stepNumber}>{step.id}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
            </div>

            <div className={styles.stepContent}>
                {/* Image Section */}
                <div className={styles.stepImageSection}>
                    {step.imageUrl ? (
                        <>
                            {!imageLoaded && !imageError && (
                                <div className={styles.stepImagePlaceholder} style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }}>
                                    <i className="nes-icon is-large image" style={{ opacity: 0.3 }}></i>
                                    <p className={styles.placeholderText} style={{ 
                                        color: "#666", 
                                        fontSize: "0.85rem",
                                        marginTop: "0.5rem",
                                        textAlign: "center"
                                    }}>Loading...</p>
                                </div>
                            )}
                            <img
                                src={step.imageUrl}
                                alt={`Step ${step.id}: ${step.title}`}
                                className={`${styles.stepImage} ${imageLoaded ? styles.stepImageLoaded : ''}`}
                                style={{ display: imageLoaded ? 'block' : 'none' }}
                                onLoad={() => setImageLoaded(true)}
                                onError={() => {
                                    setImageError(true);
                                    setImageLoaded(false);
                                }}
                            />
                        </>
                    ) : (
                        <div className={styles.stepImagePlaceholder} style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>
                            <i className="nes-icon is-large image" style={{ opacity: 0.3 }}></i>
                            <p className={styles.placeholderText} style={{ 
                                color: "#666", 
                                fontSize: "0.85rem",
                                marginTop: "0.5rem",
                                textAlign: "center"
                            }}>Loading...</p>
                        </div>
                    )}
                </div>

                {/* Instructions Section */}
                <div className={styles.stepInstructions}>
                    <ul className={`nes-list is-disc ${styles.instructionsList}`}>
                        {step.instructions.map((instruction, index) => (
                            <li key={index} className={styles.instructionItem}>
                                {instruction}
                            </li>
                        ))}
                    </ul>

                    {/* Tip Callout */}
                    {step.tip && (
                        <div className={styles.tipCallout}>
                            <div className={styles.tipHeader}>
                                <i className="nes-icon is-small trophy"></i>
                                <span className={styles.tipLabel}>TIP</span>
                            </div>
                            <p className={styles.tipText}>{step.tip}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
