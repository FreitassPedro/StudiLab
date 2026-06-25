"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfileTheme } from "./ThemeContext";
import type { ProfileUser, ProfileStats } from "../types";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/server/actions/profile.action";
import { Pencil } from "lucide-react";

function EditDialog({ children, user }: { children: React.ReactNode; user: ProfileUser }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || "");
  const [coverImage, setCoverImage] = useState(user.coverImage || "");
  const [image, setImage] = useState(user.image || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSave() {
    try {
      setLoading(true);
      await updateProfile({
        name,
        bio,
        coverImage,
        image
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
      <DialogContent className="bg-[#12121a] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="coverImage">URL da Foto de Fundo</Label>
            <Input
              id="coverImage"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              placeholder="https://..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image">URL da Foto de Perfil</Label>
            <Input
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              placeholder="https://..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="bg-white/5 border-white/10 text-white min-h-[100px]"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-white text-black hover:bg-white/90"
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
// ── Stat pill ──────────────────────────────────────────────────────────────────
function StatPill({ value, label }: { value: string; label: string }) {
  const { accent } = useProfileTheme();
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-white/[0.05] px-3.5 py-1.5 text-xs">
      <span className="font-bold" style={{ color: accent.accent }}>
        {value}
      </span>
      <span className="text-white/45">{label}</span>
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
      className="h-[180px] w-[180px] shrink-0 z-10 rounded-full p-[3px]"
      style={{
        background: `linear-gradient(135deg, ${accent.accent}, ${accent.accent2})`,
      }}
    >
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[3px] border-[#0a0a0f] bg-[#1e1e2e]">
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

// ── Main component ─────────────────────────────────────────────────────────────
interface ProfileHeaderProps {
  user: ProfileUser;
  stats: ProfileStats;
}

function formatHours(minutes: number): string {
  const h = Math.round(minutes / 60);
  return `${h.toLocaleString("pt-BR")}h`;
}

function calcConsistency(studyDays: number, createdAt: Date): string {
  const totalDays = Math.max(
    1,
    Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
  );
  const pct = Math.min(100, Math.round((studyDays / totalDays) * 100));
  return `${pct}%`;
}

export function ProfileHeader({ user, stats }: ProfileHeaderProps) {
  const { accent } = useProfileTheme();

  const totalHoursLabel = formatHours(stats.totalMinutes);
  const consistency = calcConsistency(stats.studyDays, user.createdAt);
  const firstName = user.name.split(" ")[0];

  return (
    <div className="mb-8  flex flex-wrap items-end gap-5">
      <AvatarFrame name={user.name} image={user.image} accent={accent} />

      <div className="min-w-[200px] flex-1 pb-1">
        {/* Name */}
        <div className="mb-1 flex flex-wrap items-center gap-2.5">
          <h1 className="font-['Space_Grotesk'] text-[26px] font-black leading-none tracking-[-0.5px] text-white">
            {user.name}
          </h1>
          {/* Streak tier badge */}
          <span
            className="rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
            style={{
              borderColor: accent.accent,
              color: accent.accent,
              background: `${accent.accent}26`,
            }}
          >
            {stats.currentStreak >= 60
              ? "★ Elite III"
              : stats.currentStreak >= 30
                ? "★ Elite II"
                : stats.currentStreak >= 14
                  ? "★ Elite I"
                  : "Estudante"}
          </span>
        </div>

        {/* Username / Email */}
        <div className="mb-2.5 text-[13px] text-white/40">
          @{user.username || user.email.split("@")[0]}
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="mb-3 text-[14px] text-white/80 max-w-xl">
            {user.bio}
          </div>
        )}

        {/* Status based on last subject */}
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3.5 py-1.5">
          <span>📖</span>
          <span className="text-[13px] text-white/70">
            Olá, {firstName}! Bem-vindo ao seu perfil
          </span>
        </div>

        <EditDialog user={user}>
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
          >
            <Pencil />
            Editar Perfil
          </Button>
        </EditDialog>

        {/* Social Counts & Stat pills 
        <div className="flex flex-wrap items-center gap-2">
          {user.followersCount !== undefined && (
            <StatPill value={String(user.followersCount)} label="Seguidores" />
          )}
          {user.followingCount !== undefined && (
            <StatPill value={String(user.followingCount)} label="Seguindo" />
          )}
          
          <StatPill value={totalHoursLabel} label="estudadas" />
          <StatPill value={consistency} label="consistência" />
          <StatPill value={String(stats.studyDays)} label="dias registrados" />

          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-3 py-[5px] text-xs">
            <span>🔥</span>
            <span className="font-semibold text-white/70">
              {stats.currentStreak} dias de ofensiva
            </span>
          </div>
        </div>
        */}
      </div>
    </div>
  );
}
