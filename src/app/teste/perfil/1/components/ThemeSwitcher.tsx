"use client";

import { THEME_CONFIGS } from "../mock-data";
import { useProfileTheme } from "./ThemeContext";
import type { Theme } from "../types";

export function ThemeSwitcher() {
  const { theme, setTheme } = useProfileTheme();

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#0a0a0f]/85 px-3 py-2 backdrop-blur-xl">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
        Tema
      </span>
      {THEME_CONFIGS.map((cfg) => (
        <button
          key={cfg.key}
          title={cfg.tooltip}
          onClick={() => setTheme(cfg.key as Theme)}
          className={`relative h-[18px] w-[18px] rounded-full bg-gradient-to-br ${cfg.gradient} transition-all duration-200 hover:scale-125 ${
            theme === cfg.key
              ? "ring-2 ring-white ring-offset-1 ring-offset-[#0a0a0f]"
              : ""
          }`}
          aria-label={cfg.label}
        />
      ))}
    </div>
  );
}
