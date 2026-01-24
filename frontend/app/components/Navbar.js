"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();
    const [avatarId, setAvatarId] = useState(1);
    const [username, setUsername] = useState("Guest");

    useEffect(() => {
        // Generate a random avatar ID (1-10) only on client side to avoid hydration mismatch
        const stored = localStorage.getItem("userSettings");
        if (stored) {
            const settings = JSON.parse(stored);
            setAvatarId(settings.avatarId || Math.floor(Math.random() * 10) + 1);
            setUsername(settings.username || "Guest");
        } else {
            setAvatarId(Math.floor(Math.random() * 10) + 1);
        }
    }, []);

    if (pathname.startsWith("/games/")) return null;

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <div className={styles.brand}>
                    <Link href="/" className={styles.logoLink}>
                        <i className="nes-icon snes-jp-logo is-small"></i>
                        <span className={styles.logoText}></span>
                    </Link>
                </div>

                <div className={styles.menu}>
                    <Link href="/leaderboard" className={`${styles.menuItem} ${pathname === "/leaderboard" ? styles.active : ""}`}>
                        <i className="nes-icon trophy is-small"></i>
                        <span>LEADERS</span>
                    </Link>

                    <Link href="/settings" className={styles.profileLink}>
                        <div className={styles.userProfile}>
                            <img
                                src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${avatarId}`}
                                alt="User Avatar"
                                className={styles.avatar}
                            />
                            <span className={styles.username}>{username}</span>
                        </div>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
