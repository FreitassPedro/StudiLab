"use client";

import { Trophy, Clock } from "lucide-react";

export interface FriendRankingItem {
  id: string;
  name: string;
  username: string;
  image?: string;
  minutes: number;
}

interface StandaloneFriendsRankingProps {
  ranking: FriendRankingItem[];
  accentColor?: string;
}

export function StandaloneFriendsRanking({
  ranking,
  accentColor = "#8b5cf6",
}: StandaloneFriendsRankingProps) {
  if (!ranking || ranking.length === 0) return null;


  const formatHours = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-card/40 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Ranking de Amigos
          </p>
          <p className="text-base font-bold text-foreground mt-0.5">Hoje</p>
        </div>
        <Trophy className="w-5 h-5 text-yellow-500" />
      </div>

      <div className="flex flex-col space-y-1">
        {ranking.map((friend, index) => {
          const isFirst = index === 0;

          return (
            <div
              key={friend.id}
              className="relative flex items-center gap-3 p-2 rounded-xl overflow-hidden transition-colors hover:bg-white/3"
            >

              {/* Avatar */}
              <div
                className="relative z-10 h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white"
                style={{
                  background: isFirst
                    ? `linear-gradient(135deg, ${accentColor}, #06b6d4)`
                    : "rgba(255,255,255,0.08)",
                }}
              >
                {friend.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={friend.image} alt={friend.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  friend.name.charAt(0)
                )}
              </div>

              {/* Name */}
              <div className="relative z-10 flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{friend.name}</p>
                <p className="text-[11px] text-muted-foreground">@{friend.username}</p>
              </div>

              {/* Time */}
              <div className="relative z-10 flex items-center gap-1.5 text-sm shrink-0">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span
                  className=""
                  style={{ color: isFirst ? accentColor : undefined }}
                >
                  {formatHours(friend.minutes)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
