"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [stars, setStars] = useState([]);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // Generate random stars for background
    const generatedStars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      size: Math.random() * 3 + 2,
    }));
    setStars(generatedStars);
  }, []);

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

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={`${styles.pixelArt} float`}>
            <i className="nes-octocat animate"></i>
          </div>

          <h1 className={`${styles.title} glow-text`}>
            PIXEL QUEST
          </h1>

          <p className={styles.subtitle}>
            <span className="glow-green">8-BIT</span> ADVENTURES AWAIT
          </p>

          <div className={styles.blinkContainer}>
            <span className={styles.pressStart}>PRESS START</span>
            <span className={`${styles.cursor} blink`}>_</span>
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              className="nes-btn is-primary"
              onClick={() => setShowDialog(true)}
            >
              <span>START GAME</span>
            </button>
            <button type="button" className="nes-btn is-success">
              <span>HIGH SCORES</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className="nes-container is-dark with-title">
          <p className="title">CHOOSE YOUR PATH</p>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <i className="nes-icon is-large heart"></i>
              <h3 className={styles.featureTitle}>ADVENTURE</h3>
              <p className={styles.featureText}>
                Explore dungeons and defeat monsters
              </p>
            </div>

            <div className={styles.featureCard}>
              <i className="nes-icon is-large star"></i>
              <h3 className={styles.featureTitle}>COLLECT</h3>
              <p className={styles.featureText}>
                Gather coins and power-ups
              </p>
            </div>

            <div className={styles.featureCard}>
              <i className="nes-icon is-large trophy"></i>
              <h3 className={styles.featureTitle}>COMPETE</h3>
              <p className={styles.featureText}>
                Challenge friends worldwide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className="nes-container is-rounded">
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={`${styles.statNumber} rainbow-text`}>999</span>
              <span className={styles.statLabel}>PLAYERS</span>
            </div>
            <div className={styles.statItem}>
              <span className={`${styles.statNumber} glow-blue`}>42</span>
              <span className={styles.statLabel}>LEVELS</span>
            </div>
            <div className={styles.statItem}>
              <span className={`${styles.statNumber} glow-green`}>∞</span>
              <span className={styles.statLabel}>FUN</span>
            </div>
          </div>
        </div>
      </section>

      {/* Character Selection */}
      <section className={styles.characters}>
        <h2 className={`${styles.sectionTitle} glow-text`}>SELECT HERO</h2>

        <div className={styles.characterGrid}>
          <div className={`nes-container is-rounded ${styles.characterCard}`}>
            <div className={`${styles.avatar} float`}>
              <i className="nes-mario"></i>
            </div>
            <span className={styles.characterName}>MARIO</span>
            <div className={styles.healthBar}>
              <progress className="nes-progress is-error" value="80" max="100"></progress>
            </div>
          </div>

          <div className={`nes-container is-rounded ${styles.characterCard}`}>
            <div className={`${styles.avatar} float`} style={{ animationDelay: "0.5s" }}>
              <i className="nes-ash"></i>
            </div>
            <span className={styles.characterName}>ASH</span>
            <div className={styles.healthBar}>
              <progress className="nes-progress is-warning" value="65" max="100"></progress>
            </div>
          </div>

          <div className={`nes-container is-rounded ${styles.characterCard}`}>
            <div className={`${styles.avatar} float`} style={{ animationDelay: "1s" }}>
              <i className="nes-pokeball"></i>
            </div>
            <span className={styles.characterName}>PIKA</span>
            <div className={styles.healthBar}>
              <progress className="nes-progress is-success" value="100" max="100"></progress>
            </div>
          </div>

          <div className={`nes-container is-rounded ${styles.characterCard}`}>
            <div className={`${styles.avatar} float`} style={{ animationDelay: "1.5s" }}>
              <i className="nes-kirby"></i>
            </div>
            <span className={styles.characterName}>KIRBY</span>
            <div className={styles.healthBar}>
              <progress className="nes-progress is-primary" value="90" max="100"></progress>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className={styles.newsletter}>
        <div className="nes-container is-dark with-title">
          <p className="title">JOIN THE QUEST</p>

          <p className={styles.newsletterText}>
            Enter your name, brave adventurer!
          </p>

          <div className={styles.inputGroup}>
            <div className="nes-field">
              <input
                type="text"
                id="name_field"
                className="nes-input"
                placeholder="YOUR NAME..."
              />
            </div>
            <button type="button" className="nes-btn is-warning">
              JOIN!
            </button>
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className={styles.social}>
        <div className={styles.socialLinks}>
          <a href="#" className={styles.socialLink}>
            <i className="nes-icon twitter is-medium"></i>
          </a>
          <a href="#" className={styles.socialLink}>
            <i className="nes-icon github is-medium"></i>
          </a>
          <a href="#" className={styles.socialLink}>
            <i className="nes-icon youtube is-medium"></i>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="nes-container is-centered">
          <p className={styles.footerText}>
            © 2026 PIXEL QUEST
          </p>
          <p className={styles.footerCredits}>
            MADE WITH <i className="nes-icon is-small heart"></i> & NES.CSS
          </p>
        </div>
      </footer>

      {/* Dialog */}
      {showDialog && (
        <div className={styles.dialogOverlay} onClick={() => setShowDialog(false)}>
          <div className={styles.dialogContainer} onClick={(e) => e.stopPropagation()}>
            <div className="nes-container is-rounded is-dark with-title">
              <p className="title">READY?</p>

              <div className={styles.dialogContent}>
                <i className="nes-bcrikko"></i>
                <p>Your adventure is about to begin!</p>
                <p className="glow-green">Are you ready, hero?</p>
              </div>

              <div className={styles.dialogButtons}>
                <button
                  type="button"
                  className="nes-btn is-success"
                  onClick={() => setShowDialog(false)}
                >
                  YES!
                </button>
                <button
                  type="button"
                  className="nes-btn is-error"
                  onClick={() => setShowDialog(false)}
                >
                  NOT YET
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
