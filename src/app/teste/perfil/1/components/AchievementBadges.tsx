"use client";

import { MOCK_BADGES, RARITY_COLORS } from "../mock-data";
import { useProfileTheme } from "./ThemeContext";
import { SectionLabel } from "./SectionLabel";
import type { Badge } from "../types";

interface BadgeCardProps {
  badge: Badge;
  accent: Record<string, string>;
}

function BadgeCard({ badge, accent }: BadgeCardProps) {
  const rarityColor = badge.locked
    ? "rgba(255,255,255,0.2)"
    : RARITY_COLORS[badge.rarity] || accent.accent;

  return (
    <div
      className={`flex cursor-default flex-col items-center gap-2 rounded-[14px] border border-white/[0.07] bg-white/[0.03] p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--accent-muted)] ${
        badge.locked ? "opacity-30 grayscale" : ""
      }`}
      style={{
        ["--accent" as string]: accent.accent,
        ["--accent-muted" as string]: `${accent.accent}1a`,
      }}
    >
      {/* Badge icon */}
      <div
        className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 text-2xl"
        style={{
          borderColor: `${rarityColor}66`,
          background: `${rarityColor}22`,
        }}
      >
        {badge.locked ? "🔒" : badge.emoji}
      </div>

      {/* Name */}
      <div className="text-xs font-bold leading-snug">{badge.name}</div>

      {/* Description */}
      <div className="text-[10px] leading-snug text-white/35">{badge.desc}</div>

      {/* Rarity */}
      <div
        className="text-[9px] font-bold uppercase tracking-[0.1em]"
        style={{ color: rarityColor }}
      >
        {badge.rarity}
      </div>
    </div>
  );
}

export function AchievementBadges() {
  const { accent } = useProfileTheme();
  const unlockedCount = MOCK_BADGES.filter((b) => !b.locked).length;

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <SectionLabel>Conquistas</SectionLabel>
        <span className="mb-4 text-xs text-white/30">
          {unlockedCount} de {MOCK_BADGES.length}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
        {MOCK_BADGES.map((badge, i) => (
          <BadgeCard key={i} badge={badge} accent={accent} />
        ))}
      </div>
    </section>
  );
}
