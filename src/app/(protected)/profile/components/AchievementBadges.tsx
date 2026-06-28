"use client";

import { useProfileTheme } from "./ThemeContext";
import { SectionLabel } from "./SectionLabel";
import type { ProfileBadge, BadgeRarity } from "../types";

// ── Rarity colors ──────────────────────────────────────────────────────────────
const RARITY_COLORS: Record<BadgeRarity, string> = {
  "Ultra Rara": "#fbbf24",
  Rara: "#a78bfa",
  Épica: "#f472b6",
  Incomum: "#34d399",
  Lendária: "#60a5fa",
  Mítica: "#f43f5e",
};

// ── Badge card ─────────────────────────────────────────────────────────────────
interface BadgeCardProps {
  badge: ProfileBadge;
  accent: Record<string, string>;
}

function BadgeCard({ badge, accent }: BadgeCardProps) {
  const rarityColor = badge.locked
    ? "rgba(255,255,255,0.2)"
    : RARITY_COLORS[badge.rarity] || accent.accent;

  return (
    <div
      className={`flex cursor-default flex-col items-center gap-2 rounded-[14px] border border-border bg-foreground/3 p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:bg-[var(--accent-muted)] ${
        badge.locked ? "opacity-30 grayscale" : ""
      }`}
      style={{
        ["--accent" as string]: accent.accent,
        ["--accent-muted" as string]: `${accent.accent}1a`,
      }}
    >
      {/* Icon */}
      <div
        className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 text-2xl"
        style={{
          borderColor: `${rarityColor}66`,
          background: `${rarityColor}22`,
        }}
      >
        {badge.locked ? "🔒" : badge.emoji}
      </div>

      <div className="text-xs font-bold leading-snug">{badge.name}</div>
      <div className="text-[10px] leading-snug text-foreground/35">{badge.desc}</div>

      <div
        className="text-[9px] font-bold uppercase tracking-[0.1em]"
        style={{ color: rarityColor }}
      >
        {badge.rarity}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
interface AchievementBadgesProps {
  badges: ProfileBadge[];
}

export function AchievementBadges({ badges }: AchievementBadgesProps) {
  const { accent } = useProfileTheme();
  const unlockedCount = badges.filter((b) => !b.locked).length;

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <SectionLabel>Conquistas</SectionLabel>
        <span className="mb-4 text-xs text-foreground/30">
          {unlockedCount} de {badges.length}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
        {badges.map((badge, i) => (
          <BadgeCard key={i} badge={badge} accent={accent} />
        ))}
      </div>
    </section>
  );
}
