"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import PixelBackground from "./components/PixelBackground";

const placeholderIdeas = [
  "Heart rate monitor",
  "Coffee temperature checker",
  "Plant soil health monitor",
  "Motion-activated lighting",
  "Smart doorbell with camera",
  "Weather station display",
  "Pet feeder automation",
  "Air quality sensor"
];

export default function Home() {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const currentText = placeholderIdeas[placeholderIndex];
    let timeout;

    if (!isDeleting && displayedText.length < currentText.length) {
      // Typing
      timeout = setTimeout(() => {
        setDisplayedText(currentText.slice(0, displayedText.length + 1));
      }, 50);
    } else if (!isDeleting && displayedText.length === currentText.length) {
      // Finished typing, wait then start deleting
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2000);
    } else if (isDeleting && displayedText.length > 0) {
      // Deleting
      timeout = setTimeout(() => {
        setDisplayedText(displayedText.slice(0, -1));
      }, 30);
    } else if (isDeleting && displayedText.length === 0) {
      // Finished deleting, move to next idea
      setIsDeleting(false);
      setPlaceholderIndex((prev) => (prev + 1) % placeholderIdeas.length);
    }

    return () => clearTimeout(timeout);
  }, [displayedText, placeholderIndex, isDeleting]);


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
      {/* Animated pixel background */}
      <PixelBackground variant="city" />

      {/* Hero Section */}
      {!isLoading && (
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.logoContainer}>
              <i className="nes-octocat animate"></i>
            </div>

            <h1 className={`${styles.title} glow-text`}>
              BUILDO
            </h1>

            <p className={styles.tagline}>
              Turn a <span className="glow-green">description</span> into a buildable hardware prototype
            </p>

            <p className={styles.subtitle}>
              Generate wiring diagrams, parts lists, CAD models, and code from a single idea.
            </p>

            <div className={styles.inputContainer}>
              <div className={styles.inputWrapper}>
                <input
                  ref={inputRef}
                  type="text"
                  className={`nes-input is-dark ${styles.heroInput}`}
                  placeholder=""
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
                {!inputText && (
                  <span className={styles.placeholderOverlay}>
                    {displayedText}
                    <span className={styles.cursor}>|</span>
                  </span>
                )}
              </div>
              <button
                className={`nes-btn is-success ${styles.submitBtn}`}
                onClick={handleCreate}
              >
                BUILD
              </button>
            </div>

            <p className={styles.hint}>
              <span className="blink">▶</span> Press ENTER or click BUILD to start
            </p>
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

      {/* How It Works Section */}
      {!isLoading && (
        <section className={styles.howItWorks}>
          <div className="nes-container is-dark with-title">
            <p className="title">HOW IT WORKS</p>

            <div className={styles.stepsGrid}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>DESCRIBE</h3>
                  <p className={styles.stepText}>
                    Tell us what you want to build in plain English
                  </p>
                </div>
              </div>

              <div className={styles.stepArrow}>→</div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>GENERATE</h3>
                  <p className={styles.stepText}>
                    We create all the artifacts you need to build it
                  </p>
                </div>
              </div>

              <div className={styles.stepArrow}>→</div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>BUILD</h3>
                  <p className={styles.stepText}>
                    Order parts, print enclosures, and assemble your project
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* What You Get Section */}
      {!isLoading && (
        <section className={styles.features}>
          <div className="nes-container is-dark with-title">
            <p className="title">WHAT YOU GET</p>

            <div className={styles.featureGrid}>
              <div className={styles.featureCard}>
                <span className={styles.featureEmoji}>🔧</span>
                <h3 className={styles.featureTitle}>WIRING DIAGRAMS</h3>
                <p className={styles.featureText}>
                  Visual guides showing how to connect all your components
                </p>
              </div>

              <div className={styles.featureCard}>
                <span className={styles.featureEmoji}>📦</span>
                <h3 className={styles.featureTitle}>PARTS LIST</h3>
                <p className={styles.featureText}>
                  Validated bill of materials with real parts from suppliers
                </p>
              </div>

              <div className={styles.featureCard}>
                <span className={styles.featureEmoji}>📐</span>
                <h3 className={styles.featureTitle}>CAD MODELS</h3>
                <p className={styles.featureText}>
                  Printable enclosures and mounts ready for 3D printing
                </p>
              </div>

              <div className={styles.featureCard}>
                <span className={styles.featureEmoji}>💻</span>
                <h3 className={styles.featureTitle}>FIRMWARE</h3>
                <p className={styles.featureText}>
                  Working code scaffolding for your microcontroller
                </p>
              </div>
            </div>
          </div>
        </section>
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
                <span className={`${styles.statNumber} glow-blue`}>3k+</span>
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

      {/* CTA Section */}
      {!isLoading && (
        <section className={styles.ctaSection}>
          <div className="nes-container is-rounded is-centered">
            <p className={styles.ctaText}>Ready to bring your idea to life?</p>
            <button
              className={`nes-btn is-success ${styles.ctaButton}`}
              onClick={() => document.querySelector(`.${styles.heroInput}`)?.focus()}
            >
              START BUILDING NOW
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="nes-container is-centered">
          <p className={styles.footerText}>
            Buildo © 2026 - Made with <i className="nes-icon is-small heart"></i> for makers
          </p>
        </div>
      </footer>
    </main>
  );
}
