import { getFriends } from "@/server/actions/profile.action";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/server/actions/getCurrentUser";

export interface FriendRankingItem {
  id: string;
  name: string;
  username: string;
  image?: string;
  minutes: number;
}

export async function Friends() {
  const user = await getCurrentUser();
  if (!user) return null;

  const friends = await getFriends({ targetUserId: user.id });

  return (
    <div className="rounded-2xl border border-border/40 bg-card/40 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Amigos
          </p>
        </div>
        <Trophy className="w-5 h-5 text-yellow-500" />
      </div>

      <div className="flex flex-col space-y-1">
        {friends?.map((friend) => {
          return (
            <Link
              key={friend.id}
              href={`/profile/${friend.profile?.username}`}
              className="relative flex items-center gap-3 p-2 rounded-xl overflow-hidden transition-colors hover:bg-white/3 cursor-pointer"
            >
              {/* Avatar */}
              <div className="relative z-10 h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-primary text-primary-foreground">
                {friend.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={friend.image}
                    alt={friend.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  friend.name.charAt(0)
                )}
              </div>

              {/* Name */}
              <div className="relative z-10 flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {friend.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  @{friend.profile?.username || friend.name}
                </p>
              </div>
            </Link>
          );
        })}
        {(!friends || friends.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Você ainda não tem amigos.
          </p>
        )}
      </div>
    </div>
  );
}
