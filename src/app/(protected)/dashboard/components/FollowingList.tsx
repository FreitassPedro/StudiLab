import Link from "next/link";
import { getFollowing } from "@/server/actions/follow.action";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export async function FollowingList() {
  const following = await getFollowing();


  return (
    <Card className="overflow-hidden group">
      <CardHeader className="">
        <CardTitle className="text-sm font-semibold text-white/70 uppercase tracking-widest flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Seguindo
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-5">
        {following.length === 0 ? (
          <p className="text-sm text-muted-foreground">Você ainda não segue ninguém.</p>
        ) : (
          <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {following.map((user) => {
              const initials = user.name.charAt(0).toUpperCase();
              const firstName = user.name.split(" ")[0];

              return (
                <Link
                  key={user.id}
                  href={`/profile/${user.username || user.id}`}
                  className="flex flex-col items-center gap-2 group/avatar transition-all hover:-translate-y-1 shrink-0"
                >
                  <div className="relative">
                    <div className="absolute -inset-0.5 rounded-full bg-linear-to-r from-primary/50 to-purple-500/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity blur-sm" />
                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border-2 border-white/10 relative z-10 group-hover/avatar:border-white/30 transition-colors bg-white/5">
                      <AvatarImage src={user.image || ''} alt={user.name} className="object-cover" />
                      <AvatarFallback className="bg-transparent text-white font-bold text-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-xs font-medium text-white/50 group-hover/avatar:text-white truncate max-w-[64px] text-center transition-colors">
                    {firstName}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
