"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { useTheme } from "../components/ThemeProvider";
import PixelBackground from "../components/PixelBackground";

// Preset avatar seeds for gallery
const AVATAR_PRESETS = [
    "warrior", "wizard", "rogue", "knight", "archer", "mage",
    "dragon", "phoenix", "robot", "alien", "ghost", "ninja"
];

// Accent color options
const ACCENT_COLORS = [
    { name: "Classic Red", value: "#e94560" },
    { name: "Neon Pink", value: "#ff6ec7" },
    { name: "Cyber Cyan", value: "#00d4ff" },
    { name: "Matrix Green", value: "#00ff41" },
    { name: "Golden", value: "#ffd700" },
    { name: "Purple Haze", value: "#9b59b6" },
];

export default function Settings() {
    const { theme, setTheme } = useTheme();
    const [username, setUsername] = useState("Guest");
    const [avatarId, setAvatarId] = useState("warrior");
    const [bio, setBio] = useState("");
    const [accentColor, setAccentColor] = useState("#e94560");
    const [animations, setAnimations] = useState(true);
    const [sound, setSound] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [saveMessage, setSaveMessage] = useState("");

    useEffect(() => {
        const stored = localStorage.getItem("userSettings");
        if (stored) {
            const settings = JSON.parse(stored);
            setUsername(settings.username || "Guest");
            setAvatarId(settings.avatarId || "warrior");
            setBio(settings.bio || "");
            setAccentColor(settings.accentColor || "#e94560");
            setAnimations(settings.animations !== false);
            setSound(settings.sound !== false);
            setNotifications(settings.notifications !== false);
        }
    }, []);

    // Apply accent color to CSS variable
    useEffect(() => {
        document.documentElement.style.setProperty('--accent-primary', accentColor);
    }, [accentColor]);

    const saveSettings = () => {
        const currentSettings = localStorage.getItem("userSettings")
            ? JSON.parse(localStorage.getItem("userSettings"))
            : {};

        const newSettings = {
            ...currentSettings,
            username,
            avatarId,
            bio,
            accentColor,
            animations,
            sound,
            notifications
        };

        localStorage.setItem("userSettings", JSON.stringify(newSettings));
        setSaveMessage("Settings saved!");
        setTimeout(() => setSaveMessage(""), 2000);
    };

    return (
        <main className={styles.main}>
            <PixelBackground variant="grid" animated={animations} />

            <div className={styles.container}>
                <h1 className="title glow-text" style={{ textAlign: "center", margin: "2rem 0", fontSize: "1.8rem" }}>
                    SETTINGS
                </h1>

                {/* Save Message Toast */}
                {saveMessage && (
                    <div className={styles.toast}>
                        <span className="nes-text is-success">{saveMessage}</span>
                    </div>
                )}

                {/* Profile Section */}
                <div className="nes-container is-dark with-title">
                    <p className="title">PROFILE</p>

                    <div className={styles.profileSection}>
                        <div className={styles.avatarPreview}>
                            <img
                                src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${avatarId}`}
                                alt="Current Avatar"
                                className={styles.currentAvatar}
                            />
                        </div>

                        <div className={styles.profileFields}>
                            <div className="nes-field">
                                <label htmlFor="name_field">USERNAME</label>
                                <input
                                    type="text"
                                    id="name_field"
                                    className="nes-input is-dark"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    maxLength={16}
                                />
                            </div>

                            <div className="nes-field" style={{ marginTop: "1rem" }}>
                                <label htmlFor="bio_field">BIO / TAGLINE</label>
                                <input
                                    type="text"
                                    id="bio_field"
                                    className="nes-input is-dark"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us about yourself..."
                                    maxLength={50}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Avatar Gallery */}
                    <div className={styles.avatarGallery}>
                        <p className={styles.sectionLabel}>CHOOSE AVATAR</p>
                        <div className={styles.avatarGrid}>
                            {AVATAR_PRESETS.map((preset) => (
                                <button
                                    key={preset}
                                    className={`${styles.avatarOption} ${avatarId === preset ? styles.avatarSelected : ""}`}
                                    onClick={() => setAvatarId(preset)}
                                >
                                    <img
                                        src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${preset}`}
                                        alt={preset}
                                    />
                                </button>
                            ))}
                        </div>
                        <button
                            className="nes-btn is-primary"
                            onClick={() => setAvatarId(`random_${Math.floor(Math.random() * 10000)}`)}
                            style={{ marginTop: "1rem", fontSize: "0.7rem" }}
                        >
                            🎲 RANDOM AVATAR
                        </button>
                    </div>
                </div>

                {/* Theme Section */}
                <div className="nes-container is-dark with-title" style={{ marginTop: "2rem" }}>
                    <p className="title">THEME</p>
                    <div className={styles.themeGrid}>
                        {['dark', 'light', 'cyberpunk', 'gameboy'].map((t) => (
                            <button
                                key={t}
                                className={`nes-btn ${theme === t ? "is-primary" : ""}`}
                                onClick={() => setTheme(t)}
                                style={{ textTransform: "uppercase", fontSize: "0.75rem" }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Accent Color Section */}
                <div className="nes-container is-dark with-title" style={{ marginTop: "2rem" }}>
                    <p className="title">ACCENT COLOR</p>
                    <div className={styles.colorGrid}>
                        {ACCENT_COLORS.map((color) => (
                            <button
                                key={color.value}
                                className={`${styles.colorOption} ${accentColor === color.value ? styles.colorSelected : ""}`}
                                onClick={() => setAccentColor(color.value)}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                            >
                                {accentColor === color.value && <span>✓</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="nes-container is-dark with-title" style={{ marginTop: "2rem" }}>
                    <p className="title">PREFERENCES</p>

                    <div className={styles.preferencesGrid}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                className="nes-checkbox is-dark"
                                checked={animations}
                                onChange={(e) => setAnimations(e.target.checked)}
                            />
                            <span>Animations</span>
                        </label>

                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                className="nes-checkbox is-dark"
                                checked={sound}
                                onChange={(e) => setSound(e.target.checked)}
                            />
                            <span>Sound Effects</span>
                        </label>

                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                className="nes-checkbox is-dark"
                                checked={notifications}
                                onChange={(e) => setNotifications(e.target.checked)}
                            />
                            <span>Notifications</span>
                        </label>
                    </div>
                </div>

                {/* Keyboard Shortcuts Section */}
                <div className="nes-container is-dark with-title" style={{ marginTop: "2rem" }}>
                    <p className="title">KEYBOARD SHORTCUTS</p>
                    <div className={styles.shortcutsList}>
                        <div className={styles.shortcut}>
                            <kbd className={styles.kbd}>Enter</kbd>
                            <span>Submit / Confirm</span>
                        </div>
                        <div className={styles.shortcut}>
                            <kbd className={styles.kbd}>Esc</kbd>
                            <span>Cancel / Close</span>
                        </div>
                        <div className={styles.shortcut}>
                            <kbd className={styles.kbd}>↑ ↓</kbd>
                            <span>Navigate options</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.actionButtons}>
                    <Link href="/profile/user_local">
                        <button className="nes-btn" style={{ fontSize: "0.7rem" }}>
                            VIEW PROFILE
                        </button>
                    </Link>

                    <button
                        className="nes-btn is-success"
                        onClick={saveSettings}
                        style={{ fontSize: "0.7rem" }}
                    >
                        💾 SAVE SETTINGS
                    </button>
                </div>
            </div>
        </main>
    );
}
