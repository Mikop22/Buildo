"use client";

import { useState } from "react";
import styles from "./Assembly.module.css";

// Mock assembly steps data
const assemblySteps = [
    {
        id: 1,
        title: "Prepare Your Workspace",
        instructions: [
            "Gather all required parts from your inventory",
            "Ensure you have a clean, well-lit workspace",
            "Keep tools organized and within reach"
        ],
        imageUrl: null, // Placeholder
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

    const toggleVideo = () => {
        setIsVideoOpen(!isVideoOpen);
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
                {/* Floating Video Button */}
                <button
                    type="button"
                    className={`nes-btn is-primary ${styles.videoButton} ${isVideoOpen ? styles.videoButtonHidden : ''}`}
                    onClick={toggleVideo}
                    title="Open tutorial video"
                >
                    <i className="nes-icon youtube is-small"></i>
                    <span>TUTORIAL VIDEO</span>
                </button>

                {/* Safety Warnings */}
                <SafetyWarnings warnings={safetyWarnings} />

                {/* Assembly Steps */}
                <div className={styles.stepsContainer}>
                    <h2 className={styles.stepsTitle}>ASSEMBLY STEPS</h2>
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
                        <img
                            src={step.imageUrl}
                            alt={`Step ${step.id}: ${step.title}`}
                            className={styles.stepImage}
                        />
                    ) : (
                        <div className={styles.stepImagePlaceholder}>
                            <i className="nes-icon is-large image"></i>
                            <p className={styles.placeholderText}>Step {step.id} Image</p>
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
                                <i className="nes-icon is-small star"></i>
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
