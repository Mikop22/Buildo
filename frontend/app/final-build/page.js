"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";

// Mock parts data - using similar structure to Inventory
const mockParts = [
    {
        id: 1,
        title: "Arduino Uno R3",
        imageUrl: null,
    },
    {
        id: 2,
        title: "Servo Motor SG90",
        imageUrl: null,
    },
    {
        id: 3,
        title: "Jumper Wires (M-M)",
        imageUrl: null,
    },
    {
        id: 4,
        title: "Breadboard",
        imageUrl: null,
    },
    {
        id: 5,
        title: "LEDs (Red, Green)",
        imageUrl: null,
    },
];

export default function BuildComplete() {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    const handleNewBuild = () => {
        router.push("/");
    };

    return (
        <div className={styles.buildCompleteContainer}>
            {/* Navigation Controls */}
            <div className={styles.navigationBar}>
                <button
                    type="button"
                    className="nes-btn"
                    onClick={handleBack}
                >
                    ← BACK
                </button>
                <div className={styles.congratulationsMessage}>
                    <h1 className={styles.congratulationsTitle}>
                        Congratulations on completing your build!
                    </h1>
                </div>
                <button
                    type="button"
                    className="nes-btn is-primary"
                    onClick={handleNewBuild}
                >
                    MAKE A NEW BUILD
                </button>
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
                {/* Hero Section - Completed Build Image */}
                <div className={styles.heroSection}>
                    <div className={`nes-container is-rounded is-dark ${styles.buildImageContainer}`}>
                        <div className={styles.buildImagePlaceholder}>
                            <i className="nes-icon is-large trophy"></i>
                            <p className={styles.placeholderText}>Completed Build Image</p>
                        </div>
                    </div>
                </div>

                {/* Parts List Sidebar */}
                <div className={styles.partsSection}>
                    <div className={`nes-container is-rounded is-dark ${styles.partsCard}`}>
                        <p className={styles.partsTitle}>PARTS USED</p>
                        <div className={styles.partsList}>
                            {mockParts.map((part, index) => (
                                <div key={part.id}>
                                    <div className={styles.partItem}>
                                        <div className={styles.partThumbnail}>
                                            {part.imageUrl ? (
                                                <img src={part.imageUrl} alt={part.title} />
                                            ) : (
                                                <div className={styles.partPlaceholderImage}>
                                                    <i className="nes-icon is-medium package"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.partInfo}>
                                            <h3 className={styles.partTitle}>{part.title}</h3>
                                        </div>
                                    </div>
                                    {index < mockParts.length - 1 && <div className={styles.partDivider} />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
