"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toggleFollow } from "@/server/actions/follow.action";
import { Loader2, UserPlus, UserCheck } from "lucide-react";
import { useProfileTheme } from "./ThemeContext";

export function FollowButton({ targetUserId, initialIsFollowing }: { targetUserId: string; initialIsFollowing: boolean }) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const { accent } = useProfileTheme();

  async function handleToggleFollow() {
    try {
      setLoading(true);
      const res = await toggleFollow(targetUserId);
      setIsFollowing(res.isFollowing);
    } catch (e: any) {
      alert(e.message || "Erro ao seguir usuário");
    } finally {
      setLoading(false);
    }
  }

  if (isFollowing) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggleFollow}
        disabled={loading}
        className="border-white/20 bg-white/5 text-white hover:bg-white/10"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4 mr-2" />}
        Seguindo
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      onClick={handleToggleFollow}
      disabled={loading}
      style={{ backgroundColor: accent.accent, color: "black" }}
      className="font-bold hover:brightness-110"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
      Seguir
    </Button>
  );
}
