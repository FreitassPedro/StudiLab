"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { THEME_CONFIGS, useProfileTheme } from "./ThemeContext";
import type { ProfileUser, ProfileStats, Theme } from "../types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/server/actions/profile.action";
import { Pencil, Share, Search } from "lucide-react";
import { AccountSettingsCard } from "./AccountSettingsCard";
import { FollowButton } from "./FollowButton";
import { toast } from "sonner";
import { UserSearchModal } from "./UserSearchModal";

function ThemeSwitcherProfile({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const { setTheme: themePreview } = useProfileTheme();

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background/85 px-3 py-2 backdrop-blur-xl">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground/40">
        Tema
      </span>
      {THEME_CONFIGS.map((cfg) => (
        <button
          key={cfg.key}
          title={cfg.tooltip}
          onClick={() => {
            setTheme(cfg.key as Theme);
            themePreview(cfg.key as Theme)
          }}
          className={`relative h-[18px] w-[18px] rounded-full bg-linear-to-br ${cfg.gradient} transition-all duration-200 hover:scale-125 ${theme === cfg.key
            ? "ring-2 ring-ring ring-offset-1 ring-offset-background"
            : ""
            }`}
          aria-label={cfg.label}
        />
      ))}
    </div>
  )
}

function EditDialog({ children, user, isOwner }: { children: React.ReactNode; user: ProfileUser; isOwner: boolean }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || "");
  const [coverImage, setCoverImage] = useState(user.coverImage || "");
  const [image, setImage] = useState(user.image || "");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(user.theme || "midnight");
  const { setTheme: updateTheme } = useProfileTheme();
  const router = useRouter();

  async function handleSave() {
    try {
      setLoading(true);
      await updateProfile({
        name,
        bio,
        coverImage,
        image,
        theme
      });
      setOpen(false);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar perfil");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-popover border-border text-foreground max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Configurações</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <div className="px-6">
            <TabsList className="w-full bg-foreground/5 border border-border p-1 rounded-xl mb-2">
              <TabsTrigger value="profile" className="flex-1 rounded-lg data-[state=active]:bg-foreground/10 data-[state=active]:text-foreground text-foreground/60">
                Perfil
              </TabsTrigger>
              {isOwner && (
                <TabsTrigger value="account" className="flex-1 rounded-lg data-[state=active]:bg-foreground/10 data-[state=active]:text-foreground text-foreground/60">
                  Conta
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* ABA DE PERFIL */}
          <TabsContent value="profile" className="px-6 pb-6 m-0 focus-visible:outline-none">
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="coverImage">URL da Foto de Fundo</Label>
                <Input
                  id="coverImage"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="bg-foreground/5 border-border text-foreground"
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">URL da Foto de Perfil</Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="bg-foreground/5 border-border text-foreground"
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-foreground/5 border-border text-foreground"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-foreground/5 border-border text-foreground min-h-[100px]"
                />
              </div>
              <ThemeSwitcherProfile
                theme={theme as Theme}
                setTheme={setTheme}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                className="hover:bg-foreground/5 hover:text-foreground">
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-card text-foreground hover:bg-foreground/90"
              >
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </TabsContent>

          {/* ABA DE CONTA */}
          {isOwner && (
            <TabsContent value="account" className="px-6 pb-6 m-0 focus-visible:outline-none max-h-[60vh] overflow-y-auto">
              <AccountSettingsCard user={user} />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
// ── Stat pill ──────────────────────────────────────────────────────────────────
function StatPill({ value, label }: { value: string; label: string }) {
  const { accent } = useProfileTheme();
  return (
    <div className="flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs">
      <span className="font-bold" style={{ color: accent.accent }}>
        {value}
      </span>
      <span className="text-foreground/45">{label}</span>
    </div>
  );
}

// ── Avatar frame with gradient ring ───────────────────────────────────────────
function AvatarFrame({
  name,
  image,
  accent,
}: {
  name: string;
  image?: string | null;
  accent: Record<string, string>;
}) {
  // Initials fallback
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="h-[180px] w-[180px] -mt-16 shrink-0 z-10 rounded-full p-[3px]"
    >
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[3px] border-background bg-card">
        {image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className="font-['Space_Grotesk'] text-2xl font-black"
            style={{ color: accent.accent }}
          >
            {initials}
          </span>
        )}
      </div>
    </div>
  );
}

// Ranks 6h, 24h, 60h, 100h, 200h, 500h, 1000h 
function getStreakTier(totalMinutes: number) {
  const hours = totalMinutes / 60;
  console.log("hours: ", hours);
  
  if (hours < 1) return { tier: 1, rank: "Novato", color: "#9CA3AF" };
  if (hours < 80) return { tier: 2, rank: "Estudante", color: "#60A5FA" };
  if (hours < 500) return { tier: 3, rank: "★ Elite I", color: "#A855F7" };
  if (hours < 800) return { tier: 4, rank: "★ Elite II", color: "#EC4899" };
  if (hours < 2000) return { tier: 5, rank: "★ Elite III", color: "#EC4899" };
  if (totalMinutes < 4000) return { tier: 6, rank: "✧ Mestre I", color: "#EC4899" };
  if (totalMinutes < 6000) return { tier: 7, rank: "✧ Mestre II", color: "#EC4899" };
  return { tier: 8, rank: "✧ Catedrático", color: "#EC4899" };
}
// ── Main component ─────────────────────────────────────────────────────────────
interface ProfileHeaderProps {
  user: ProfileUser;
  stats: ProfileStats;
  isOwner: boolean;
  isFollowing: boolean;
}


export function ProfileHeader({ user, stats, isOwner, isFollowing }: ProfileHeaderProps) {
  const { accent } = useProfileTheme();

  return (
    <div className="mb-8 mt-4 flex flex-wrap items-end gap-5">
      <AvatarFrame name={user.name} image={user.image} accent={accent} />

      <div className="min-w-[200px] flex-1 pb-1">
        {/* Name */}
        <div className="mb-1 flex flex-wrap items-center gap-2.5">
          <h1 className="font-['Space_Grotesk'] text-3xl font-black leading-none tracking-[-0.5px] text-foreground">
            {user.name}
          </h1>
          {/* Streak badge */}
          {stats.currentStreak > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all shadow-sm"
              style={{
                background: stats.currentStreak >= 3 ? `${accent.accent}20` : "var(--muted)",
                boxShadow: stats.currentStreak >= 3 ? `0 0 20px -5px ${accent.accent}` : 'none',
                borderColor: stats.currentStreak >= 3 ? `${accent.accent}80` : "var(--border)"
              }}>
              <span className={stats.currentStreak >= 3 ? "animate-pulse drop-shadow-md" : ""}
                style={stats.currentStreak >= 3 ? { filter: `drop-shadow(0 0 5px ${accent.accent})` } : {}}>
                🔥
              </span>
              <span className="font-semibold" style={{ color: stats.currentStreak >= 3 ? accent.accent : "var(--foreground)" }}>
                {stats.currentStreak} dias
              </span>
            </div>
          )}

          {/* Tier badge based on total study hours */}

          <span
            className="rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
            style={{
              borderColor: accent.accent,
              color: accent.accent,
              background: `${accent.accent}26`,
            }}
          >
            {getStreakTier(stats.totalMinutes)?.rank}
          </span>
        </div>

        {/* Username / Email */}
        <div className="mb-2.5 text-[16px] text-foreground/40">
          @{user.username || user.email.split("@")[0]}
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="mb-3 text-[14px] text-foreground/80 max-w-xl">
            {user.bio}
          </div>
        )}

        {/* Followers / Following Stats */}
        <div className="flex flex-wrap items-center gap-3 mt-4 mb-3">
          {user.followersCount !== undefined && (
            <StatPill value={String(user.followersCount)} label="Seguidores" />
          )}
          {user.followingCount !== undefined && (
            <StatPill value={String(user.followingCount)} label="Seguindo" />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isOwner && (
            <EditDialog user={user} isOwner={isOwner}>
              <Button
                variant="default"
                size="sm"
                className="rounded-xl shadow-sm transition-all hover:-translate-y-0.5 font-medium"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            </EditDialog>
          )}

          {isOwner && (
            <UserSearchModal>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-xl shadow-sm transition-all hover:-translate-y-0.5 border border-border/40 font-medium"
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar Amigos
              </Button>
            </UserSearchModal>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await navigator.clipboard.writeText(`https://studilab.vercel.app/profile/${user.username}`);
              toast.success("Link copiado para a área de transferência!");
            }}
            className="rounded-xl shadow-sm transition-all hover:-translate-y-0.5 border-border/60 hover:bg-muted/50 font-medium"
          >
            <Share className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>

          {!isOwner && (
            <FollowButton targetUserId={user.id} initialIsFollowing={isFollowing} />
          )}
        </div>
      </div>
    </div>
  );
}
