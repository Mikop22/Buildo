"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../../page.module.css";
import { updateLocalScore } from "../../utils/userData";

export default function PuzzleGame() {
    const [stars, setStars] = useState([]);
    const [sequence, setSequence] = useState([]);
    const [playerSequence, setPlayerSequence] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isShowingSequence, setIsShowingSequence] = useState(false);
    const [activeButton, setActiveButton] = useState(null);
    const [level, setLevel] = useState(1);
    const [message, setMessage] = useState("Press START to begin!");
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    const colors = [
        { id: 0, color: "is-error", emoji: "🔴" },
        { id: 1, color: "is-primary", emoji: "🔵" },
        { id: 2, color: "is-success", emoji: "🟢" },
        { id: 3, color: "is-warning", emoji: "🟡" },
    ];

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

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const startGame = async () => {
        setIsPlaying(true);
        setGameOver(false);
        setLevel(1);
        setSequence([]);
        setPlayerSequence([]);
        await addToSequence([]);
    };

    const addToSequence = async (currentSequence) => {
        const newColor = Math.floor(Math.random() * 4);
        const newSequence = [...currentSequence, newColor];
        setSequence(newSequence);
        setPlayerSequence([]);
        setMessage(`Level ${newSequence.length} - Watch carefully!`);

        await sleep(500);
        setIsShowingSequence(true);

        for (const colorId of newSequence) {
            setActiveButton(colorId);
            await sleep(600);
            setActiveButton(null);
            await sleep(300);
        }

        setIsShowingSequence(false);
        setMessage("Your turn! Repeat the pattern.");
    };

    const handleColorClick = async (colorId) => {
        if (!isPlaying || isShowingSequence || gameOver) return;

        setActiveButton(colorId);
        await sleep(200);
        setActiveButton(null);

        const newPlayerSequence = [...playerSequence, colorId];
        setPlayerSequence(newPlayerSequence);

        // Check if the clicked color is correct
        const currentIndex = newPlayerSequence.length - 1;
        if (sequence[currentIndex] !== colorId) {
            // Wrong!
            setGameOver(true);
            setIsPlaying(false);
            const finalScore = (level - 1) * 100;
            setScore(finalScore);
            updateLocalScore(finalScore);
            setMessage(`Game Over! Score: ${finalScore}`);
            return;
        }

        // Check if sequence is complete
        if (newPlayerSequence.length === sequence.length) {
            setLevel(l => l + 1);
            setMessage("Correct! Get ready for the next level...");
            await sleep(1000);
            await addToSequence(sequence);
        }
    };

    const resetGame = () => {
        setIsPlaying(false);
        setGameOver(false);
        setSequence([]);
        setPlayerSequence([]);
        setLevel(1);
        setMessage("Press START to begin!");
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
                    <span className={styles.logoIcon}>🧠</span>
                </div>
                <h1 className={`${styles.gamePageTitle} glow-text`}>BRAIN BLOCKS</h1>
                <p className={styles.gamePageSubtitle}>
                    Memory Challenge • Repeat the Pattern
                </p>
            </section>

            {/* Level Display */}
            <section style={{ textAlign: "center", position: "relative", zIndex: 1, marginBottom: "1rem" }}>
                <span className="glow-blue" style={{ fontSize: "0.7rem" }}>LEVEL</span>
                <span className={`${styles.statNumber} rainbow-text`} style={{ display: "block" }}>
                    {level}
                </span>
            </section>

            {/* Game Area */}
            <section className={styles.gameContainer}>
                <div className={`nes-container is-rounded ${styles.gameArea}`}>
                    <div className={styles.gameAreaContent}>
                        <p className={styles.gameAreaText} style={{ marginBottom: "1.5rem" }}>
                            {message}
                        </p>

                        {/* Color Buttons Grid */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: "1rem",
                            marginBottom: "1.5rem"
                        }}>
                            {colors.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    className={`nes-btn ${c.color}`}
                                    onClick={() => handleColorClick(c.id)}
                                    disabled={!isPlaying || isShowingSequence || gameOver}
                                    style={{
                                        fontSize: "2rem",
                                        padding: "1.5rem",
                                        opacity: activeButton === c.id ? 1 : (isShowingSequence ? 0.5 : 0.8),
                                        transform: activeButton === c.id ? "scale(1.1)" : "scale(1)",
                                        transition: "all 0.15s ease",
                                        boxShadow: activeButton === c.id ? `0 0 20px var(--accent-primary)` : "none",
                                    }}
                                >
                                    {c.emoji}
                                </button>
                            ))}
                        </div>

                        {/* Controls */}
                        <div className={styles.gameControls}>
                            {!isPlaying && !gameOver && (
                                <button
                                    type="button"
                                    className="nes-btn is-success"
                                    onClick={startGame}
                                >
                                    START GAME
                                </button>
                            )}
                            {gameOver && (
                                <button
                                    type="button"
                                    className="nes-btn is-warning"
                                    onClick={resetGame}
                                >
                                    PLAY AGAIN
                                </button>
                            )}
                            {isPlaying && !gameOver && (
                                <button
                                    type="button"
                                    className="nes-btn"
                                    onClick={resetGame}
                                >
                                    RESET
                                </button>
                            )}
                        </div>
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
                            <span>Watch the color sequence carefully</span>
                        </li>
                        <li className={styles.instructionItem}>
                            <span className={styles.instructionNumber}>2</span>
                            <span>Click the colors in the same order</span>
                        </li>
                        <li className={styles.instructionItem}>
                            <span className={styles.instructionNumber}>3</span>
                            <span>Each level adds one more color</span>
                        </li>
                        <li className={styles.instructionItem}>
                            <span className={styles.instructionNumber}>4</span>
                            <span>One mistake and it&apos;s game over!</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className="nes-container is-centered">
                    <p className={styles.footerCredits}>
                        BRAIN BLOCKS <i className="nes-icon is-small trophy"></i> PIXEL ARCADE
                    </p>
                </div>
            </footer>
        </main>
    );
}
