"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getLocalUser, saveLocalUser } from "../utils/userData";

const ThemeContext = createContext({
    theme: "dark",
    setTheme: () => { }
});

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const user = getLocalUser();
        // Check if user has settings.theme, otherwise default to "dark"
        // We assume getLocalUser returns a valid object, but let's check settings existence
        if (user && user.settings && user.settings.theme) {
            setTheme(user.settings.theme);
        } else {
            // If no theme saved, keep default but save it to ensure consistency? 
            // Or just let it be. Let's just set it.
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            document.documentElement.setAttribute("data-theme", theme);
            // Persist to local storage via user settings
            const user = getLocalUser();
            if (!user.settings) user.settings = {};

            // Only save if it changed
            if (user.settings.theme !== theme) {
                user.settings.theme = theme;
                saveLocalUser(user);
            }
        }
    }, [theme, mounted]);

    // Prevent flash of unstyled theme
    if (!mounted) {
        return <div style={{ visibility: "hidden" }}>{children}</div>;
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
