"use client";

import { useProfileTheme } from "./ThemeContext";

export function ProfileBanner({ coverImage }: { coverImage?: string | null }) {
  const { accent } = useProfileTheme();

  return (
    <div
      className="relative h-[220px] w-full overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${accent.bannerFrom} 0%, ${accent.bannerMid} 50%, ${accent.bannerTo} 100%)`,
      }}
    >
      {/* Cover Image Overwrite */}
      {coverImage && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-80 mix-blend-overlay"
          style={{ backgroundImage: `url(${coverImage})` }}
        />
      )}

      {/* Radial glows */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 80% at 30% 50%, ${accent.accent}26 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 75% 30%, ${accent.accent2}14 0%, transparent 70%)
          `,
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-50 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-30 z-0"
        style={{
          backgroundImage: `
            linear-gradient(${accent.accent}26 1px, transparent 1px),
            linear-gradient(90deg, ${accent.accent}26 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.5) 40%, transparent)",
        }}
      />     
    </div>
  );
}
