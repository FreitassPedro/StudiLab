"use client";

import { useProfileTheme } from "./ThemeContext";

interface QuoteCardProps {
  quote: string;
  label: string;
}

export function QuoteCard({ quote, label }: QuoteCardProps) {
  const { accent } = useProfileTheme();

  return (
    <div
      className="mb-9 rounded-xl px-5 py-4"
      style={{
        background: `${accent.accent}1a`,
        border: `1px solid ${accent.accent}`,
        borderLeft: `3px solid ${accent.accent}`,
      }}
    >
      <p className="text-sm italic leading-relaxed text-white/60">
        &ldquo;{quote}&rdquo;
      </p>
      <p
        className="mt-2 text-[11px] font-semibold"
        style={{ color: accent.accent }}
      >
        — {label}
      </p>
    </div>
  );
}
