"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { mockUsers } from "../data/users";
import { getLocalUser } from "../utils/userData";

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([]);

    useEffect(() => {
        const localUser = getLocalUser();
        // Combine mock users and local user
        const allUsers = [...mockUsers, localUser];
        // Sort by score descending
        setLeaders(allUsers.sort((a, b) => b.score - a.score));
    }, []);

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <h1 className="title glow-text" style={{ textAlign: "center", margin: "2rem 0", fontSize: "2rem" }}>
                    HALL OF FAME
                </h1>

                <div className="nes-container is-dark with-title">
                    <p className="title">TOP PLAYERS</p>

                    <div className="nes-table-responsive">
                        <table className="nes-table is-bordered is-dark is-centered" style={{ width: "100%", tableLayout: "fixed" }}>
                            <thead>
                                <tr>
                                    <th style={{ width: "15%" }}>RANK</th>
                                    <th style={{ width: "50%" }}>PLAYER</th>
                                    <th style={{ width: "35%" }}>SCORE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaders.map((leader, index) => (
                                    <tr key={leader.id} style={{
                                        cursor: "pointer",
                                        backgroundColor: leader.id === "user_local" ? "rgba(233, 69, 96, 0.1)" : "transparent",
                                        border: leader.id === "user_local" ? "2px solid var(--accent-primary)" : "none"
                                    }}>
                                        <td style={{ verticalAlign: "middle", color: index === 0 ? "var(--pixel-yellow)" : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : "inherit" }}>
                                            {index === 0 ? "👑 1ST" : `${index + 1}TH`}
                                        </td>
                                        <td style={{ verticalAlign: "middle", textAlign: "left", padding: 0 }}>
                                            <Link href={`/profile/${leader.id}`} style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%", padding: "0.75rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                    <img
                                                        src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${leader.avatarId}`}
                                                        alt="avatar"
                                                        style={{ width: "32px", height: "32px", borderRadius: "4px", flexShrink: 0, backgroundColor: "rgba(255,255,255,0.1)" }}
                                                    />
                                                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className={styles.playerNameHover}>
                                                        {leader.username}
                                                    </span>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="rainbow-text" style={{ verticalAlign: "middle" }}>{leader.score.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
