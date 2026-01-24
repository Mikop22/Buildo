"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../../page.module.css";
import { updateLocalScore } from "../../utils/userData";

export default function AdventureGame() {
    const [stars, setStars] = useState([]);
    const [health, setHealth] = useState(100);
    const [gold, setGold] = useState(0);
    const [location, setLocation] = useState("entrance");
    const [message, setMessage] = useState("You stand at the dungeon entrance...");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (health === 0 && gold > 0 && !saved) {
            updateLocalScore(gold);
            setSaved(true);
        }
    }, [health, gold, saved]);

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

    const locations = {
        entrance: {
            emoji: "🏰",
            actions: [
                { label: "ENTER DUNGEON", next: "hallway", message: "You venture into the dark hallway..." },
                { label: "REST", effect: () => setHealth(Math.min(100, health + 20)), message: "You rest and recover 20 HP!" },
            ]
        },
        hallway: {
            emoji: "🚪",
            actions: [
                { label: "GO LEFT", next: "treasure", message: "You find a treasure room!" },
                { label: "GO RIGHT", next: "monster", message: "A monster appears!" },
                { label: "GO BACK", next: "entrance", message: "You retreat to the entrance..." },
            ]
        },
        treasure: {
            emoji: "💰",
            actions: [
                { label: "TAKE GOLD (+50)", effect: () => setGold(g => g + 50), next: "hallway", message: "You collected 50 gold!" },
                { label: "SEARCH MORE", effect: () => { setGold(g => g + 100); setHealth(h => h - 10); }, next: "hallway", message: "Found 100 gold but triggered a trap! -10 HP" },
            ]
        },
        monster: {
            emoji: "👹",
            actions: [
                { label: "FIGHT!", effect: () => { setHealth(h => Math.max(0, h - 30)); setGold(g => g + 75); }, next: "hallway", message: "You defeated the monster! +75 gold, but took 30 damage." },
                { label: "RUN AWAY", next: "entrance", message: "You fled back to the entrance!" },
            ]
        },
    };

    const handleAction = (action) => {
        if (action.effect) action.effect();
        if (action.next) setLocation(action.next);
        setMessage(action.message);
    };

    const resetGame = () => {
        setHealth(100);
        setGold(0);
        setLocation("entrance");
        setMessage("You stand at the dungeon entrance...");
        setSaved(false);
    };

    const currentLocation = locations[location];

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
                    <span className={styles.logoIcon}>⚔️</span>
                </div>
                <h1 className={`${styles.gamePageTitle} glow-text`}>DUNGEON QUEST</h1>
                <p className={styles.gamePageSubtitle}>
                    Explore • Fight • Collect Treasure
                </p>
            </section>

            {/* Stats Bar */}
            <section style={{ padding: "0 2rem", maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                <div className="nes-container is-rounded" style={{ background: "rgba(0,0,0,0.6)" }}>
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <span style={{ fontSize: "0.5rem", color: "var(--text-muted)" }}>HEALTH</span>
                            <progress
                                className={`nes-progress ${health > 50 ? "is-success" : health > 25 ? "is-warning" : "is-error"}`}
                                value={health}
                                max="100"
                                style={{ width: "100%" }}
                            ></progress>
                            <span className="glow-green" style={{ fontSize: "0.7rem" }}>{health}/100</span>
                        </div>
                        <div className={styles.statItem}>
                            <span style={{ fontSize: "0.5rem", color: "var(--text-muted)" }}>GOLD</span>
                            <span className="rainbow-text" style={{ fontSize: "1.2rem" }}>💰 {gold}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Game Area */}
            <section className={styles.gameContainer}>
                <div className={`nes-container is-rounded ${styles.gameArea}`}>
                    {health > 0 ? (
                        <div className={styles.gameAreaContent}>
                            <span className={styles.gameAreaEmoji}>{currentLocation.emoji}</span>
                            <p className={styles.gameAreaText} style={{ marginBottom: "1.5rem" }}>
                                {message}
                            </p>
                            <div className={styles.gameControls}>
                                {currentLocation.actions.map((action, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        className={`nes-btn ${i === 0 ? "is-primary" : i === 1 ? "is-warning" : ""}`}
                                        onClick={() => handleAction(action)}
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.gameAreaContent}>
                            <span className={styles.gameAreaEmoji}>💀</span>
                            <p className="glow-text" style={{ fontSize: "1rem", marginBottom: "1rem" }}>GAME OVER</p>
                            <p className={styles.gameAreaText}>
                                You collected {gold} gold before falling in battle.
                            </p>
                            {saved && <p className="is-success" style={{ color: "#92cc41", marginBottom: "1rem" }}>Score Saved!</p>}
                            <button
                                type="button"
                                className="nes-btn is-success"
                                onClick={resetGame}
                            >
                                TRY AGAIN
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Instructions */}
            <section className={styles.instructionsSection}>
                <div className="nes-container is-dark with-title">
                    <p className="title">HOW TO PLAY</p>
                    <ul className={styles.instructionsList}>
                        <li className={styles.instructionItem}>
                            <span className={styles.instructionNumber}>1</span>
                            <span>Choose your actions wisely</span>
                        </li>
                        <li className={styles.instructionItem}>
                            <span className={styles.instructionNumber}>2</span>
                            <span>Collect as much gold as possible</span>
                        </li>
                        <li className={styles.instructionItem}>
                            <span className={styles.instructionNumber}>3</span>
                            <span>Watch your health - don&apos;t let it reach zero!</span>
                        </li>
                        <li className={styles.instructionItem}>
                            <span className={styles.instructionNumber}>4</span>
                            <span>Rest at the entrance to recover HP</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className="nes-container is-centered">
                    <p className={styles.footerCredits}>
                        DUNGEON QUEST <i className="nes-icon is-small heart"></i> PIXEL ARCADE
                    </p>
                </div>
            </footer>
        </main>
    );
}
