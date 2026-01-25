"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();
    const [avatarId, setAvatarId] = useState(1);
    const [username, setUsername] = useState("Guest");
    const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

    useEffect(() => {
        // Generate a random avatar ID (1-10) only on client side to avoid hydration mismatch
        const stored = localStorage.getItem("userSettings");
        if (stored) {
            const settings = JSON.parse(stored);
            setAvatarId(settings.avatarId || Math.floor(Math.random() * 10) + 1);
            setUsername(settings.username || "Guest");
        } else {
            setAvatarId(Math.floor(Math.random() * 10) + 1);
        }
    }, []);

    if (pathname.startsWith("/games/")) return null;

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <div className={styles.leftSection}>
                    <Link href="/" className={styles.logoLink}>
                        <i className="nes-icon snes-jp-logo is-small"></i>
                        <span className={styles.logoText}>BUILDO</span>
                    </Link>
                    <button 
                        className={styles.menuItem}
                        onClick={() => setIsHowItWorksOpen(!isHowItWorksOpen)}
                    >
                        <i className="nes-icon question is-small"></i>
                        <span>HOW IT WORKS</span>
                    </button>
                </div>

                <div className={styles.rightSection}>
                    <Link href="/arcade" className={`${styles.menuItem} ${pathname === "/arcade" ? styles.active : ""}`}>
                        <i className="nes-icon coin is-small"></i>
                        <span>ARCADE</span>
                    </Link>

                    <Link href="/leaderboard" className={`${styles.menuItem} ${pathname === "/leaderboard" ? styles.active : ""}`}>
                        <i className="nes-icon trophy is-small"></i>
                        <span>LEADERS</span>
                    </Link>

                    <Link href="/settings" className={styles.profileLink}>
                        <div className={styles.userProfile}>
                            <img
                                src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${avatarId}`}
                                alt="User Avatar"
                                className={styles.avatar}
                            />
                            <span className={styles.username}>{username}</span>
                        </div>
                    </Link>
                </div>

                {/* How It Works Modal */}
                {isHowItWorksOpen && (
                    <>
                        <div className={styles.modalOverlay} onClick={() => setIsHowItWorksOpen(false)}></div>
                        <div className={styles.modalContent}>
                            <div className="nes-container is-dark with-title">
                                <p className="title">How it works</p>
                                <button 
                                    className={styles.closeButton}
                                    onClick={() => setIsHowItWorksOpen(false)}
                                >
                                    ×
                                </button>
                                
                                <div className={styles.stepsGrid}>
                                    <div className={styles.step}>
                                        <div className={styles.stepNumber}>1️⃣</div>
                                        <div className={styles.stepContent}>
                                            <h3 className={styles.stepTitle}>Describe your idea</h3>
                                            <p className={styles.stepText}>
                                                Type what you want to build — what it should sense, display, or react to.
                                            </p>
                                            <p className={styles.stepExample}>
                                                (Example: plant health monitor, temperature alert, motion detector)
                                            </p>
                                        </div>
                                    </div>

                                    <div className={styles.stepArrow}>→</div>

                                    <div className={styles.step}>
                                        <div className={styles.stepNumber}>2️⃣</div>
                                        <div className={styles.stepContent}>
                                            <h3 className={styles.stepTitle}>We generate the full build</h3>
                                            <p className={styles.stepText}>
                                                We turn your idea into a complete, buildable prototype, including:
                                            </p>
                                            <ul className={styles.stepList}>
                                                <li>Visual previews of the device</li>
                                                <li>A curated, shoppable parts list</li>
                                                <li>Wiring diagrams and pin mappings</li>
                                                <li>Firmware/code ready to copy and upload</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className={styles.stepArrow}>→</div>

                                    <div className={styles.step}>
                                        <div className={styles.stepNumber}>3️⃣</div>
                                        <div className={styles.stepContent}>
                                            <h3 className={styles.stepTitle}>Assemble and watch it work</h3>
                                            <p className={styles.stepText}>
                                                Follow clear, step-by-step assembly instructions and wiring walkthroughs.
                                            </p>
                                            <p className={styles.stepText}>
                                                Upload the code, power it on, and see your project come to life.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
}
