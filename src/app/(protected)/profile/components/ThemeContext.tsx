"use client";

import React, { createContext, useContext, useState } from "react";
import type { Theme } from "../types";

// ── Theme accent tokens ────────────────────────────────────────────────────────

export const THEME_ACCENT: Record<Theme, Record<string, string>> = {
  midnight: {
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
  sunset: {
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
  delicatessen: {
    accent: "oklch(51.8% 0.253 323.949)",
    accent2: "oklch(59.1% 0.293 322.896)",
    accentText: "text-fuchsia-300",
    accentBorder: "border-fuchsia-500",
    accentBg: "bg-fuchsia-500/15",
    accentGlow: "shadow-fuchsia-500/25",
    bannerFrom: "#0f0709",
    bannerMid: "#1f0b14",
    bannerTo: "#180710",
    gradientFrom: "from-fuchsia-900/40",
    gradientTo: "to-fuchsia-900/20",
    barGradient: "from-fuchsia-500 to-pink-300",
    ringColor: "border-fuchsia-500/80",
    avatarGradient: "from-fuchsia-400 to-pink-300",
  },
  sky: {
    accent: "#06b6d4",
    accent2: "#38bdf8",
    accentText: "text-blue-300",
    accentBorder: "border-blue-500",
    accentBg: "bg-blue-500/15",
    accentGlow: "shadow-blue-500/25",
    bannerFrom: "#0a0f14",
    bannerMid: "#0f1a2a",
    bannerTo: "#071418",
    gradientFrom: "from-blue-900/40",
    gradientTo: "to-sky-900/20",
    barGradient: "from-blue-500 to-sky-400",
    ringColor: "border-blue-500/80",
    avatarGradient: "from-blue-400 to-sky-400",
  },
  forest: {
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

export const THEME_CONFIGS: { key: Theme, label: string, gradient: string, tooltip: string }[] = [
  { key: "midnight", label: "Midnight", gradient: "from-violet-800 to-purple-600", tooltip: "Midnight" },
  { key: "sunset", label: "Sunset", gradient: "from-amber-400 to-rose-400", tooltip: "Sunset" },
  { key: "delicatessen", label: "Delicatessen", gradient: "from-fuchsia-400 to-pink-300", tooltip: "Delicatessen" },
  { key: "forest", label: "Forest", gradient: "from-emerald-300 to-indigo-400", tooltip: "Forest" },
  { key: "sky", label: "Sky", gradient: "from-blue-400 to-sky-400", tooltip: "Sky" },
];

// ── Context ────────────────────────────────────────────────────────────────────
interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  accent: Record<string, string>;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "midnight",
  setTheme: () => { },
  accent: THEME_ACCENT["midnight"],
});

export function ProfileThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("midnight");
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
