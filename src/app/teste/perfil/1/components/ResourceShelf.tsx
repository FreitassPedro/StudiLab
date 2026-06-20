"use client";

import { MOCK_SHELF } from "../mock-data";
import { useProfileTheme } from "./ThemeContext";
import { SectionLabel } from "./SectionLabel";
import type { ShelfItem } from "../types";

interface ShelfCardProps {
  item: ShelfItem;
  accent: Record<string, string>;
}

function ShelfCard({ item, accent }: ShelfCardProps) {
  return (
    <div
      className="flex cursor-default items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--accent-muted)]"
      style={{
        ["--accent" as string]: accent.accent,
        ["--accent-muted" as string]: `${accent.accent}1a`,
      }}
    >
      {/* Emoji */}
      <div className="flex-shrink-0 text-[28px] leading-none">{item.emoji}</div>

      <div className="min-w-0 flex-1">
        {/* Type label */}
        <div
          className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.1em]"
          style={{ color: accent.accent }}
        >
          {item.type}
        </div>

        {/* Title */}
        <div className="truncate text-sm font-bold leading-snug">{item.title}</div>

        {/* Subtitle */}
        <div className="mt-0.5 text-[11px] text-white/35">{item.sub}</div>

        {/* Progress bar */}
        {item.progress != null && (
          <div className="mt-2">
            <div className="h-1 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${item.progress}%`,
                  background: `linear-gradient(90deg, ${accent.accent}, ${accent.accent2})`,
                }}
              />
            </div>
            <div className="mt-0.5 text-right text-[10px] text-white/30">
              {item.progress}% lido
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ResourceShelf() {
  const { accent } = useProfileTheme();

  return (
    <section className="mb-10">
      <SectionLabel>Na Prateleira — O que estou usando</SectionLabel>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        {MOCK_SHELF.map((item, i) => (
          <ShelfCard key={i} item={item} accent={accent} />
        ))}
      </div>
    </section>
  );
}
