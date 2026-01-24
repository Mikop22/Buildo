"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { mockUsers, achievements } from "../../data/users";
import { getLocalUser } from "../../utils/userData";
import styles from "../../page.module.css";

export default function ProfilePage({ params }) {
    const unwrappedParams = use(params);
    const { id } = unwrappedParams;
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API fetch delay
        setTimeout(() => {
            let foundUser;
            if (id === "user_local") {
                foundUser = getLocalUser();
            } else {
                foundUser = mockUsers.find(u => u.id === id);
            }
            setUser(foundUser);
            setLoading(false);
        }, 500);
    }, [id]);

    if (loading) {
        return (
            <main className={styles.main}>
                <div className={styles.container} style={{ textAlign: "center", paddingTop: "4rem" }}>
                    <p className="title glow-text">LOADING PROFILE...</p>
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className={styles.main}>
                <div className={styles.container} style={{ textAlign: "center", paddingTop: "4rem" }}>
                    <p className="title is-error">USER NOT FOUND</p>
                    <Link href="/leaderboard">
                        <button className="nes-btn">BACK TO LEADERS</button>
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <div className={styles.container} style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem" }}>

                {/* Profile Header */}
                <div className="nes-container is-dark with-title is-centered">
                    <p className="title">PROFILE</p>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                        <div style={{ position: "relative" }}>
                            <img
                                src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${user.avatarId}`}
                                alt={user.username}
                                style={{
                                    width: "128px",
                                    height: "128px",
                                    borderRadius: "8px",
                                    border: "4px solid #fff",
                                    background: "#212529"
                                }}
                            />
                            <span className="nes-badge" style={{ position: "absolute", bottom: "-10px", right: "-10px" }}>
                                <span className="is-warning">lvl.{user.stats.games}</span>
                            </span>
                        </div>

                        <h2 className="glow-text" style={{ fontSize: "2rem", margin: "0.5rem 0" }}>{user.username}</h2>

                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <span className="nes-text is-primary">RANK #{user.rank}</span>
                            <span className="nes-text is-disabled">•</span>
                            <span className="nes-text is-success">MEMBER SINCE {user.joined}</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "2rem" }}>
                    <div className="nes-container is-rounded is-dark is-centered">
                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>SCORE</p>
                        <p className="rainbow-text" style={{ fontSize: "1.2rem" }}>{user.score.toLocaleString()}</p>
                    </div>
                    <div className="nes-container is-rounded is-dark is-centered">
                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>WINS</p>
                        <p className="is-success" style={{ fontSize: "1.2rem", color: "#92cc41" }}>{user.stats.wins}</p>
                    </div>
                    <div className="nes-container is-rounded is-dark is-centered">
                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>PLAYTIME</p>
                        <p style={{ fontSize: "1.2rem", color: "#209cee" }}>{user.stats.playtime}</p>
                    </div>
                </div>

                {/* Achievements */}
                <div className="nes-container is-dark with-title" style={{ marginTop: "2rem" }}>
                    <p className="title">ACHIEVEMENTS</p>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                        {achievements.map(ach => {
                            const isUnlocked = user.achievements.includes(ach.id);
                            return (
                                <div
                                    key={ach.id}
                                    className="nes-container is-rounded"
                                    style={{
                                        padding: "1rem",
                                        backgroundColor: isUnlocked ? "rgba(255,255,255,0.05)" : "transparent",
                                        opacity: isUnlocked ? 1 : 0.5,
                                        border: isUnlocked ? "4px solid var(--pixel-yellow)" : "4px dashed #666",
                                        textAlign: "center"
                                    }}
                                >
                                    <i className={`nes-icon is-large ${ach.icon} ${isUnlocked ? "" : "is-transparent"}`}
                                        style={{ filter: isUnlocked ? "none" : "grayscale(100%)" }}
                                    ></i>
                                    <p style={{ marginTop: "0.5rem", color: isUnlocked ? "var(--pixel-yellow)" : "#888", fontSize: "0.8rem" }}>
                                        {ach.name}
                                    </p>
                                    <p style={{ fontSize: "0.6rem", color: "#666" }}>{ach.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>


                <div style={{ marginTop: "2rem", textAlign: "center", display: "flex", justifyContent: "center", gap: "1rem" }}>
                    <Link href="/leaderboard">
                        <button className="nes-btn">← BACK TO LEADERS</button>
                    </Link>
                    {user.id === "user_local" && (
                        <Link href="/settings">
                            <button className="nes-btn is-primary">EDIT PROFILE</button>
                        </Link>
                    )}
                </div>

            </div>
        </main>
    );
}
