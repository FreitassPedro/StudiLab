"use client";

import React, { createContext, useContext, useState } from "react";
import type { Theme } from "../types";

// ── Theme accent tokens ────────────────────────────────────────────────────────
export const THEME_ACCENT: Record<string, Record<string, string>> = {
  cyberpunk: {
    accent: "#8b5cf6",
    accent2: "#06b6d4",
    accentText: "text-violet-300",
    accentBorder: "border-violet-500",
    accentBg: "bg-violet-500/15",
    accentGlow: "shadow-violet-500/25",
    bannerFrom: "#0f0f14",
    bannerMid: "#1a0a2e",
    bannerTo: "#0d1a2a",
    gradientFrom: "from-violet-900/40",
    gradientTo: "to-cyan-900/20",
    barGradient: "from-violet-500 to-cyan-400",
    ringColor: "border-violet-500/80",
    avatarGradient: "from-violet-500 to-cyan-400",
  },
  lofi: {
    accent: "#f59e0b",
    accent2: "#fb7185",
    accentText: "text-amber-300",
    accentBorder: "border-amber-500",
    accentBg: "bg-amber-500/15",
    accentGlow: "shadow-amber-500/25",
    bannerFrom: "#0f0a05",
    bannerMid: "#1f1208",
    bannerTo: "#180810",
    gradientFrom: "from-amber-900/40",
    gradientTo: "to-rose-900/20",
    barGradient: "from-amber-400 to-rose-400",
    ringColor: "border-amber-500/80",
    avatarGradient: "from-amber-400 to-rose-400",
  },
  minimal: {
    accent: "#6ee7b7",
    accent2: "#818cf8",
    accentText: "text-emerald-300",
    accentBorder: "border-emerald-400",
    accentBg: "bg-emerald-400/12",
    accentGlow: "shadow-emerald-400/20",
    bannerFrom: "#050f0a",
    bannerMid: "#0a1a12",
    bannerTo: "#050814",
    gradientFrom: "from-emerald-900/40",
    gradientTo: "to-indigo-900/20",
    barGradient: "from-emerald-400 to-indigo-400",
    ringColor: "border-emerald-400/80",
    avatarGradient: "from-emerald-300 to-indigo-400",
  },
};

export const THEME_CONFIGS = [
  { key: "cyberpunk", label: "Cyberpunk", gradient: "from-violet-500 to-cyan-400", tooltip: "Cyberpunk" },
  { key: "lofi", label: "Lo-Fi Café", gradient: "from-amber-400 to-rose-400", tooltip: "Lo-Fi Café" },
  { key: "minimal", label: "Minimalista", gradient: "from-emerald-300 to-indigo-400", tooltip: "Minimalista" },
];

// ── Context ────────────────────────────────────────────────────────────────────
interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  accent: Record<string, string>;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "cyberpunk",
  setTheme: () => {},
  accent: THEME_ACCENT["cyberpunk"],
});

export function ProfileThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("cyberpunk");
  const setTheme = (t: Theme) => setThemeState(t);
  const accent = THEME_ACCENT[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useProfileTheme() {
  return useContext(ThemeContext);
}
