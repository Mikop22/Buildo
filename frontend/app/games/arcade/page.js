"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../../page.module.css";

export default function ArcadeGame() {
    const [stars, setStars] = useState([]);
    const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const generatedStars = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            delay: Math.random() * 3,
            size: Math.random() * 3 + 2,
        }));
        setStars(generatedStars);
    }, []);

    const handleStart = () => {
        setIsPlaying(true);
        setScore(0);
    };

    const handleClick = () => {
        if (isPlaying) {
            setScore(s => s + 10);
        }
    };

    return (
        <main className={styles.main}>
            {/* Star Background */}
            <div className={styles.starContainer}>
                {stars.map((star) => (
                    <div
                        key={star.id}
                        className={styles.star}
                        style={{
                            left: `${star.left}%`,
                            top: `${star.top}%`,
                            animationDelay: `${star.delay}s`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                        }}
                    />
                ))}
            </div>

            {/* Back Button */}
            <Link href="/">
                <button type="button" className={`nes-btn ${styles.backButton}`}>
                    ← BACK
                </button>
            </Link>

            {/* Hero */}
            <section className={styles.gamePageHero}>
                <div className={`${styles.logoContainer} float`}>
                    <span className={styles.logoIcon}>⚡</span>
                </div>
                <h1 className={`${styles.gamePageTitle} glow-text`}>ARCADE BLITZ</h1>
                <p className={styles.gamePageSubtitle}>
                    Fast-paced action • Click as fast as you can!
                </p>
            </section>

            {/* Game Area */}
            <section className={styles.gameContainer}>
                <div className={`nes-container is-rounded ${styles.gameArea}`}>
                    <div className={styles.gameAreaContent}>
                        {!isPlaying ? (
                            <>
                                <span className={styles.gameAreaEmoji}>🕹️</span>
                                <p className={styles.gameAreaText}>
                                    Click the button as fast as you can to score points!
                                </p>
                                <div className={styles.gameControls}>
                                    <button
                                        type="button"
                                        className="nes-btn is-warning"
                                        onClick={handleStart}
                                    >
                                        START GAME
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ marginBottom: "1rem" }}>
                                    <span className="glow-green" style={{ fontSize: "0.7rem" }}>SCORE</span>
                                    <span className={`${styles.statNumber} rainbow-text`} style={{ display: "block", marginTop: "0.5rem" }}>
                                        {score}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className="nes-btn is-error"
                                    onClick={handleClick}
                                    style={{ fontSize: "1.5rem", padding: "2rem 3rem" }}
                                >
                                    👊 CLICK!
                                </button>
                                <div style={{ marginTop: "1.5rem" }}>
                                    <button
                                        type="button"
                                        className="nes-btn"
                                        onClick={() => setIsPlaying(false)}
                                    >
                                        STOP
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Instructions */}
            <section className={styles.instructionsSection}>
                <div className="nes-container is-dark with-title">
                    <p className="title">HOW TO PLAY</p>
                    <ul className={styles.instructionsList}>
                        <li className={styles.instructionItem}>
                            <span className={styles.instructionNumber}>1</span>
                            <span>Press START GAME to begin</span>
                        </li>
                        <li className={styles.instructionItem}>
                            <span className={styles.instructionNumber}>2</span>
                            <span>Click the CLICK button as fast as you can</span>
                        </li>
                        <li className={styles.instructionItem}>
                            <span className={styles.instructionNumber}>3</span>
                            <span>Each click scores 10 points</span>
                        </li>
                        <li className={styles.instructionItem}>
                            <span className={styles.instructionNumber}>4</span>
                            <span>Try to beat your high score!</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className="nes-container is-centered">
                    <p className={styles.footerCredits}>
                        ARCADE BLITZ <i className="nes-icon is-small star"></i> PIXEL ARCADE
                    </p>
                </div>
            </footer>
        </main>
    );
}
