"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  const [stars, setStars] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

      {/* Nyan Cat Background */}
      <img
        src="https://media.tenor.com/-AyTtMgs2mMAAAAi/nyan-cat-nyan.gif"
        alt="Nyan Cat"
        className={styles.nyanCatBackground}
      />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={`${styles.logoContainer} float`}>
            <i className="nes-octocat animate"></i>
          </div>

          <h1 className={`${styles.title} glow-text`}>
            PROJECT NAME
          </h1>

          <p className={styles.subtitle}>
            <span className="glow-green">SUB</span> TITLE
          </p>

          <div className={styles.inputContainer}>
            <input
              type="text"
              className={`nes-input is-dark ${styles.heroInput}`}
              placeholder="CREATE A NEW PROJECT..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              className={`nes-btn is-error ${styles.submitBtn}`}
              onClick={() => setIsLoading(true)}
            >
              CREATE
            </button>
          </div>

          {/* Loading Screen */}
          {isLoading && (
            <div className={styles.loadingScreen}>
              <div className={styles.batteryContainer}>
                <div className={styles.batteryBody}>
                  <div className={styles.batteryLevel}></div>
                </div>
                <div className={styles.batteryBump}></div>
              </div>
              <p className={`${styles.loadingText} blink`}>CHARGING...</p>
            </div>
          )}

          <div className={styles.blinkContainer}>
            <span className={styles.pressStart}>SELECT A GAME</span>
            <span className={`${styles.cursor} blink`}>▼</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className="nes-container is-rounded">
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={`${styles.statNumber} rainbow-text`}>3</span>
              <span className={styles.statLabel}>GAMES</span>
            </div>
            <div className={styles.statItem}>
              <span className={`${styles.statNumber} glow-blue`}>∞</span>
              <span className={styles.statLabel}>LEVELS</span>
            </div>
            <div className={styles.statItem}>
              <span className={`${styles.statNumber} glow-green`}>24/7</span>
              <span className={styles.statLabel}>PLAY</span>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className={styles.gamesSection}>
        <h2 className={`${styles.sectionTitle} glow-text`}>CHOOSE YOUR GAME</h2>

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

      {/* Features Section
      <section className={styles.features}>
        <div className="nes-container is-dark with-title">
          <p className="title">WHY PIXEL ARCADE?</p>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <span className={styles.featureEmoji}>⚡</span>
              <h3 className={styles.featureTitle}>INSTANT PLAY</h3>
              <p className={styles.featureText}>
                No downloads. Jump right into the action!
              </p>
            </div>

            <div className={styles.featureCard}>
              <span className={styles.featureEmoji}>🏆</span>
              <h3 className={styles.featureTitle}>LEADERBOARDS</h3>
              <p className={styles.featureText}>
                Compete globally and claim your rank
              </p>
            </div>

            <div className={styles.featureCard}>
              <span className={styles.featureEmoji}>🎯</span>
              <h3 className={styles.featureTitle}>ACHIEVEMENTS</h3>
              <p className={styles.featureText}>
                Unlock badges and show off your skills
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="nes-container is-centered">
          <p className={styles.footerText}>
            Project Name
          </p>
        </div>
      </footer>
    </main>
  );
}
