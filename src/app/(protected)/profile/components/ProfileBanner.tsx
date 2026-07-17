"use client";

import { useProfileTheme } from "./ThemeContext";

export function ProfileBanner({ coverImage }: { coverImage?: string | null }) {
  const { accent } = useProfileTheme();

  return (
    <div
      className="relative h-[260px] w-full overflow-hidden"
      style={{
        background: ``,
      }}
    >
      {/* Cover Image Overwrite */}
      {coverImage && (
        <div
          className="absolute inset-0 z-0 opacity-70 bg-cover bg-center"
          style={{ backgroundImage: `url(${coverImage})` }}
        />
      )}

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
