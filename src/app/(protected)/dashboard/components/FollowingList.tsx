import Link from "next/link";
import { getFollowing } from "@/server/actions/follow.action";

export async function FollowingList() {
  const following = await getFollowing();

  if (following.length === 0) return null;

  return (
    <div className="mt-8 mb-4">
      <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Pessoas que você segue</h3>
      <div className="flex flex-wrap gap-4">
        {following.map((user) => (
          <Link
            key={user.id}
            href={`/profile/${user.username || user.id}`}
            className="flex flex-col items-center gap-2 group transition-transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden bg-white/5 group-hover:border-white/30 transition-colors">
              {user.image ? (
                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-lg text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-xs text-white/70 group-hover:text-white truncate max-w-[60px]">
              {user.name.split(" ")[0]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
