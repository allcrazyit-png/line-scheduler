"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
    theme: Theme;
    setTheme: (t: Theme) => void;
    resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: "system",
    setTheme: () => { },
    resolvedTheme: "light",
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("system");
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

    const applyTheme = (t: Theme) => {
        const root = document.documentElement;
        let resolved: "light" | "dark";

        if (t === "system") {
            resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
        } else {
            resolved = t;
        }

        if (resolved === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        setResolvedTheme(resolved);
    };

    useEffect(() => {
        const saved = (localStorage.getItem("theme") as Theme) || "system";
        setThemeState(saved);
        applyTheme(saved);

        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
            const current = (localStorage.getItem("theme") as Theme) || "system";
            if (current === "system") applyTheme("system");
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    const setTheme = (t: Theme) => {
        localStorage.setItem("theme", t);
        setThemeState(t);
        applyTheme(t);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
