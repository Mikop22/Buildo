"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

import { useTheme } from "../components/ThemeProvider";

export default function Settings() {
    const { theme, setTheme } = useTheme();
    const [username, setUsername] = useState("Guest");
    const [avatarId, setAvatarId] = useState(1);
    const [notifications, setNotifications] = useState(true);
    const [sound, setSound] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("userSettings");
        if (stored) {
            const settings = JSON.parse(stored);
            setUsername(settings.username || "Guest");
            setAvatarId(settings.avatarId || 1);
            setNotifications(settings.notifications !== false);
            setSound(settings.sound !== false);
        }
    }, []);

    const saveSettings = () => {
        // Theme is saved automatically by ThemeProvider, we just save the rest here
        const currentSettings = localStorage.getItem("userSettings")
            ? JSON.parse(localStorage.getItem("userSettings"))
            : {};

        const newSettings = {
            ...currentSettings,
            username,
            avatarId,
            notifications,
            sound
        };

        localStorage.setItem("userSettings", JSON.stringify(newSettings));
        // Force reload to update navbar if username changed
        window.location.reload();
    };

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <h1 className="title glow-text" style={{ textAlign: "center", margin: "2rem 0", fontSize: "2rem" }}>
                    SETTINGS
                </h1>

                <div className="nes-container is-dark with-title">
                    <p className="title">PROFILE</p>

                    <div className={styles.profileSection}>
                        <div className={styles.avatarPreview}>
                            <img
                                src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${avatarId}`}
                                alt="Current Avatar"
                                style={{ width: "100px", height: "100px", borderRadius: "8px", border: "4px solid white" }}
                            />
                            <button
                                className="nes-btn is-primary is-small"
                                onClick={() => setAvatarId(Math.floor(Math.random() * 1000))}
                                style={{ marginTop: "1rem" }}
                            >
                                RANDOMIZE
                            </button>
                        </div>

                        <div className="nes-field" style={{ flex: 1 }}>
                            <label htmlFor="name_field">USERNAME</label>
                            <input
                                type="text"
                                id="name_field"
                                className="nes-input"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="nes-container is-dark with-title" style={{ marginTop: "2rem" }}>
                    <p className="title">THEME</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        {['dark', 'light', 'cyberpunk', 'gameboy'].map((t) => (
                            <button
                                key={t}
                                className={`nes-btn ${theme === t ? "is-primary" : ""}`}
                                onClick={() => setTheme(t)}
                                style={{ textTransform: "uppercase" }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="nes-container is-dark with-title" style={{ marginTop: "2rem" }}>
                    <p className="title">PREFERENCES</p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <label>
                            <input
                                type="checkbox"
                                className="nes-checkbox is-dark"
                                checked={sound}
                                onChange={(e) => setSound(e.target.checked)}
                            />
                            <span>Sound Effects</span>
                        </label>

                        <label>
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

                <Link href="/profile/user_local">
                    <button
                        className="nes-btn is-primary"
                        style={{ width: "100%", marginTop: "2rem" }}
                    >
                        VIEW ACCOUNT / SAVED PROJECTS
                    </button>
                </Link>

                <button
                    className="nes-btn is-success"
                    style={{ width: "100%", marginTop: "2rem" }}
                    onClick={saveSettings}
                >
                    SAVE SETTINGS
                </button>
            </div>
        </main>
    );
}
