// Theme provider. Drives the `.dark` class on <html> (the strategy index.css
// keys off), persists the choice, and exposes a toggle. Defaults to dark.

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
};

function readInitial() {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem("dsaviz-theme");
  if (saved === "light" || saved === "dark") return saved;
  return "dark"; // product default
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitial);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("dsaviz-theme", theme);
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  const value = {
    theme,
    isDark: theme === "dark",
    setTheme,
    toggle,
  };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
