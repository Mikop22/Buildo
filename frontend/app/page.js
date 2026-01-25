"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
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

  const handleCreate = () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    // Generate a URL-friendly ID from the project name
    const projectId = inputText
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Save to localStorage
    const savedProjects = JSON.parse(localStorage.getItem("savedProjects") || "[]");
    const exists = savedProjects.some(p => p.id === projectId);

    if (!exists) {
      const newProject = {
        id: projectId,
        name: inputText,
        date: new Date().toLocaleDateString(),
        status: "In Progress"
      };
      const updatedProjects = [newProject, ...savedProjects];
      localStorage.setItem("savedProjects", JSON.stringify(updatedProjects));
    }

    // Navigate to the build page
    setTimeout(() => {
      router.push(`/build/${projectId}`);
    }, 2000);
  };

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
      {!isLoading && (
        <img
          src="https://media.tenor.com/-AyTtMgs2mMAAAAi/nyan-cat-nyan.gif"
          alt="Nyan Cat"
          className={styles.nyanCatBackground}
        />
      )}

      {/* Hero Section */}
      {!isLoading && (
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={`${styles.logoContainer} float`}>
              <i className="nes-octocat animate"></i>
            </div>

            <h1 className={`${styles.title} glow-text`}>
              BUILDO
            </h1>

            <p className={styles.subtitle}>
              <span className="glow-green">TURN YOUR</span> IDEAS INTO REALITY
            </p>

            <div className={styles.inputContainer}>
              <input
                type="text"
                className={`nes-input is-dark ${styles.heroInput}`}
                placeholder="DESCRIBE YOUR BUILD IDEA..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <button
                className={`nes-btn is-success ${styles.submitBtn}`}
                onClick={handleCreate}
              >
                BUILD
              </button>
            </div>

            <div className={styles.blinkContainer}>
              <span className={styles.pressStart}>ENTER YOUR IDEA TO GET STARTED</span>
              <span className={`${styles.cursor} blink`}>▼</span>
            </div>
          </div>
        </section>
      )}

      {/* Loading Screen */}
      {isLoading && (
        <div className={styles.loadingScreen}>
          <div className={styles.batteryContainer}>
            <div className={styles.batteryBody}>
              <div className={styles.batteryLevel}></div>
            </div>
            <div className={styles.batteryBump}></div>
          </div>
          <p className={`${styles.loadingText} blink`}>GENERATING BUILD...</p>
        </div>
      )}

      {/* Stats Section */}
      {!isLoading && (
        <section className={styles.stats}>
          <div className="nes-container is-rounded">
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={`${styles.statNumber} rainbow-text`}>∞</span>
                <span className={styles.statLabel}>IDEAS</span>
              </div>
              <div className={styles.statItem}>
                <span className={`${styles.statNumber} glow-blue`}>1000+</span>
                <span className={styles.statLabel}>PARTS</span>
              </div>
              <div className={styles.statItem}>
                <span className={`${styles.statNumber} glow-green`}>24/7</span>
                <span className={styles.statLabel}>BUILD</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      {!isLoading && (
        <section className={styles.features}>
          <div className="nes-container is-dark with-title">
            <p className="title">WHY BUILDO?</p>

            <div className={styles.featureGrid}>
              <div className={styles.featureCard}>
                <span className={styles.featureEmoji}>🔧</span>
                <h3 className={styles.featureTitle}>WIRING DIAGRAMS</h3>
                <p className={styles.featureText}>
                  Get detailed wiring and connection guides
                </p>
              </div>

              <div className={styles.featureCard}>
                <span className={styles.featureEmoji}>📦</span>
                <h3 className={styles.featureTitle}>PARTS LIST</h3>
                <p className={styles.featureText}>
                  Everything you need to buy, organized
                </p>
              </div>

              <div className={styles.featureCard}>
                <span className={styles.featureEmoji}>📐</span>
                <h3 className={styles.featureTitle}>CAD MODELS</h3>
                <p className={styles.featureText}>
                  3D models ready for printing or reference
                </p>
              </div>

              <div className={styles.featureCard}>
                <span className={styles.featureEmoji}>💻</span>
                <h3 className={styles.featureTitle}>CODE</h3>
                <p className={styles.featureText}>
                  Ready-to-flash firmware and software
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="nes-container is-centered">
          <p className={styles.footerText}>
            Buildo © 2026
          </p>
        </div>
      </footer>
    </main>
  );
}
