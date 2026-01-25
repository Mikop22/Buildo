"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function ArcadePage() {
    const [stars, setStars] = useState([]);

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

    const games = [
        {
            id: "arcade",
            name: "ARCADE BLITZ",
            description: "Fast-paced action with explosive gameplay",
            icon: "coin",
            color: "is-warning",
            difficulty: 75,
            players: "1-2",
        },
        {
            id: "adventure",
            name: "DUNGEON QUEST",
            description: "Explore mysterious dungeons and find treasure",
            icon: "heart",
            color: "is-error",
            difficulty: 60,
            players: "1",
        },
        {
            id: "puzzle",
            name: "BRAIN BLOCKS",
            description: "Test your mind with challenging puzzles",
            icon: "trophy",
            color: "is-success",
            difficulty: 85,
            players: "1",
        },
    ];

    return (
        <main className={styles.main}>
            {/* Animated star background */}
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

            {/* Header */}
            <section className={styles.header}>
                <Link href="/" className={styles.backLink}>
                    ← Back to Buildo
                </Link>
                <h1 className={`${styles.title} glow-text`}>BUILDO ARCADE</h1>
                <p className={styles.subtitle}>
                    Take a break and play some retro games!
                </p>
            </section>

            {/* Games Grid */}
            <section className={styles.gamesSection}>
                <div className={styles.gamesGrid}>
                    {games.map((game, index) => (
                        <Link
                            href={`/games/${game.id}`}
                            key={game.id}
                            className={styles.gameCardLink}
                        >
                            <div
                                className={`nes-container is-rounded ${styles.gameCard}`}
                                style={{ animationDelay: `${index * 0.15}s` }}
                            >
                                <div className={`${styles.gameIcon} float`} style={{ animationDelay: `${index * 0.3}s` }}>
                                    <i className={`nes-icon is-large ${game.icon}`}></i>
                                </div>

                                <h3 className={styles.gameName}>{game.name}</h3>
                                <p className={styles.gameDescription}>{game.description}</p>

                                <div className={styles.gameStats}>
                                    <div className={styles.gameStat}>
                                        <span className={styles.gameStatLabel}>DIFFICULTY</span>
                                        <progress
                                            className={`nes-progress ${game.color}`}
                                            value={game.difficulty}
                                            max="100"
                                        ></progress>
                                    </div>
                                    <div className={styles.gameStat}>
                                        <span className={styles.gameStatLabel}>PLAYERS: {game.players}</span>
                                    </div>
                                </div>

                                <button type="button" className={`nes-btn ${game.color} ${styles.playBtn}`}>
                                    PLAY NOW
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
}
