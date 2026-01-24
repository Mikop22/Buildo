"use client";

const DEFAULT_USER = {
    id: "user_local",
    username: "Guest",
    avatarId: 1,
    score: 0,
    rank: 999,
    joined: new Date().getFullYear().toString(),
    stats: { games: 0, wins: 0, playtime: "0h" },
    achievements: [],
    settings: {
        notifications: true,
        sound: true
    }
};

export function getLocalUser() {
    if (typeof window === 'undefined') return DEFAULT_USER;

    const stored = localStorage.getItem("userSettings");
    if (!stored) {
        return DEFAULT_USER;
    }

    const parsed = JSON.parse(stored);
    return { ...DEFAULT_USER, ...parsed };
}

export function saveLocalUser(userData) {
    if (typeof window === 'undefined') return;
    localStorage.setItem("userSettings", JSON.stringify(userData));
}

export function updateLocalScore(points) {
    const user = getLocalUser();
    user.score = (user.score || 0) + points;
    user.stats.games = (user.stats.games || 0) + 1;
    saveLocalUser(user);
    return user;
}

export function unlockAchievement(achievementId) {
    const user = getLocalUser();
    if (!user.achievements.includes(achievementId)) {
        user.achievements.push(achievementId);
        saveLocalUser(user);
        return true; // Unlocked new achievement
    }
    return false;
}
