"use client";

import { useProfileTheme } from "./ThemeContext";
import type { UserProfile } from "../types";

interface ProfileHeaderProps {
  user: UserProfile;
}

function StatPill({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const { accent } = useProfileTheme();
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-white/[0.05] px-3.5 py-1.5 text-xs">
      <span
        className="font-bold"
        style={{ color: accent.accentTextColor || accent.accent }}
      >
        {value}
      </span>
      <span className="text-white/45">{label}</span>
    </div>
  );
}

function AvatarFrame({ emoji, accent }: { emoji: string; accent: Record<string, string> }) {
  return (
    <div
      className="h-[108px] w-[108px] flex-shrink-0 rounded-full p-[3px]"
      style={{
        background: `linear-gradient(135deg, ${accent.accent}, ${accent.accent2})`,
      }}
    >
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[3px] border-[#0a0a0f] bg-[#1e1e2e] text-[40px]">
        {emoji}
      </div>
    </div>
  );
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const { accent } = useProfileTheme();

  return (
    <div className="mb-8 mt-[-54px] flex flex-wrap items-end gap-5">
      <AvatarFrame emoji={user.avatarEmoji} accent={accent} />

      <div className="min-w-[200px] flex-1 pb-1">
        {/* Name + tier */}
        <div className="mb-1 flex flex-wrap items-center gap-2.5">
          <h1 className="font-['Space_Grotesk'] text-[26px] font-black leading-none tracking-[-0.5px] text-white">
            {user.name}
          </h1>
          <span
            className="rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
            style={{
              borderColor: accent.accent,
              color: accent.accent,
              background: `${accent.accent}26`,
            }}
          >
            {user.tier}
          </span>
        </div>

        {/* Username */}
        <div className="mb-2.5 text-[13px] text-white/40">{user.username}</div>

        {/* Status badge */}
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5">
          <span>{user.statusEmoji}</span>
          <span className="text-[13px] text-white/70">{user.status}</span>
        </div>

        {/* Stat pills row */}
        <div className="flex flex-wrap items-center gap-2">
          <StatPill value={user.totalHours} label="estudadas" />
          <StatPill value={user.consistency} label="consistência" />
          <StatPill value={user.daysRecorded} label="dias registrados" />

          {/* Goal badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-3 py-[5px] text-xs">
            <span>{user.goalEmoji}</span>
            <span className="font-semibold text-white/70">{user.goalText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
