"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "./requireAuth";
import type {
  ProfileData,
  ProfileBadge,
  ProfileStats,
  ProfileSubject,
  ProfileSession,
  ProfileUser,
} from "@/app/(protected)/profile/types";
import { notFound } from "next/navigation";
import { revalidateTag, revalidatePath, unstable_cache } from "next/cache";

// ── Cache Global Invariável (badges mudam raramente) ───────────────────────────
const getCachedBadges = unstable_cache(
  async () => await prisma.badge.findMany(),
  ["all-badges-keys"],
  { revalidate: 86400, tags: ["badges"] }
);

// ── Cache das estatísticas do perfil ──────────────────────────────────────────
// Estratégia: 3 queries paralelas e especializadas em vez de 1 query massiva com JOIN triplo.
//  1. heatmap  — select { study_date, duration_minutes } sem JOIN, payload mínimo
//  2. recent   — take:10 com JOIN completo, ordenado DESC
//  3. groupBy  — agrupamento por subject feito no banco, não em memória JS
const buildCachedProfileStats = (userId: string) =>
  unstable_cache(
    async () => {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const sixMonthsAgo = new Date(today.getTime() - 182 * 86400000);
      const todayStr = today.toISOString().split("T")[0];

      // O(1) — lookup por chave primária na tabela desnormalizada
      const userStats = await prisma.userStats.findUnique({ where: { userId } });

      // Fallback zero: NÃO chama recomputeUserStats aqui.
      // O recompute só é chamado em mutações (createStudyLog, updateStudyLog, deleteStudyLog).
      const safeStats = userStats ?? {
        totalMinutes: 0,
        totalSessions: 0,
        studyDays: 0,
        currentStreak: 0,
        longestStreak: 0,
        weeklyMinutes: 0,
      };

      // 3 queries paralelas e especializadas
      const [heatmapRows, recentLogs, subjectAggregates] = await Promise.all([
        // 1. Heatmap: só date + minutes, sem JOIN — payload mínimo
        prisma.studyLogs.findMany({
          where: {
            topic: { subject: { userId } },
            study_date: { gte: sixMonthsAgo, lte: today },
          },
          select: { study_date: true, duration_minutes: true },
        }),

        // 2. Sessões recentes: 25 linhas com JOIN completo.
        // take:25 (em vez de 10) cobre os top subjects do groupBy sem precisar de query extra.
        prisma.studyLogs.findMany({
          where: { topic: { subject: { userId } } },
          include: { topic: { include: { subject: true } } },
          orderBy: { start_time: "desc" },
          take: 25,
        }),

        // 3. Top subjects: groupBy no banco por subjectId, top 5
        prisma.studyLogs.groupBy({
          by: ["topicId"],
          where: {
            topic: { subject: { userId } },
            study_date: { gte: sixMonthsAgo, lte: today },
          },
          _sum: { duration_minutes: true },
          orderBy: { _sum: { duration_minutes: "desc" } },
          take: 20, // pega mais para poder agrupar por subject depois
        }),
      ]);

      // Heatmap derivado da query leve
      const heatmap: Record<string, number> = {};
      let todayMinutes = 0;

      for (const row of heatmapRows) {
        const dateStr = row.study_date.toISOString().split("T")[0];
        heatmap[dateStr] = (heatmap[dateStr] ?? 0) + row.duration_minutes;
        if (dateStr === todayStr) todayMinutes += row.duration_minutes;
      }

      // Mapa topicId → subject info (reutiliza dados das sessões recentes)
      const subjectInfoMap = new Map<string, { id: string; name: string; color: string; emoji: string }>();
      for (const log of recentLogs) {
        const s = log.topic.subject;
        if (!subjectInfoMap.has(log.topicId)) {
          subjectInfoMap.set(log.topicId, { id: s.id, name: s.name, color: s.color, emoji: s.icon ?? "📚" });
        }
      }

      // Para topics do groupBy que não apareceram nas 10 recentes, busca pontualmente
      const missingTopicIds = subjectAggregates
        .map((a) => a.topicId)
        .filter((tid) => !subjectInfoMap.has(tid));

      if (missingTopicIds.length > 0) {
        const missingTopics = await prisma.topic.findMany({
          where: { id: { in: missingTopicIds } },
          select: { id: true, subject: { select: { id: true, name: true, color: true, icon: true } } },
        });
        for (const t of missingTopics) {
          subjectInfoMap.set(t.id, {
            id: t.subject.id,
            name: t.subject.name,
            color: t.subject.color,
            emoji: t.subject.icon ?? "📚",
          });
        }
      }

      // Agrega minutos por subjectId (groupBy foi por topicId)
      const subjectMinutes = new Map<string, { name: string; color: string; emoji: string; minutes: number }>();
      for (const agg of subjectAggregates) {
        const info = subjectInfoMap.get(agg.topicId);
        if (!info) continue;
        const existing = subjectMinutes.get(info.id);
        if (existing) {
          existing.minutes += agg._sum.duration_minutes ?? 0;
        } else {
          subjectMinutes.set(info.id, {
            name: info.name,
            color: info.color,
            emoji: info.emoji,
            minutes: agg._sum.duration_minutes ?? 0,
          });
        }
      }

      const topSubjects: ProfileSubject[] = Array.from(subjectMinutes.values())
        .sort((a, b) => b.minutes - a.minutes)
        .slice(0, 5);

      // Exibe apenas as 10 mais recentes — os 25 carregados foram usados para cobrir os subjects
      const recentSessions: ProfileSession[] = recentLogs.slice(0, 10).map((log) => ({
        id: log.id,
        subjectName: log.topic.subject.name,
        subjectColor: log.topic.subject.color,
        topicName: log.topic.name,
        duration_minutes: log.duration_minutes,
        start_time: log.start_time,
        study_date: log.study_date,
        notes: log.notes,
      }));

      const stats: ProfileStats = {
        totalMinutes: safeStats.totalMinutes,
        totalSessions: safeStats.totalSessions,
        studyDays: safeStats.studyDays,
        currentStreak: safeStats.currentStreak,
        longestStreak: safeStats.longestStreak,
        weeklyMinutes: safeStats.weeklyMinutes,
        bestWeekMinutes: safeStats.weeklyMinutes,
        bestWeekLabel: "Semana Atual",
        avgMinutesPerDay:
          safeStats.studyDays > 0
            ? Math.round(safeStats.totalMinutes / safeStats.studyDays)
            : 0,
        todayMinutes,
      };

      return { heatmap, topSubjects, recentSessions, stats };
    },
    [`profile-stats-${userId}`],
    // TTL: 15 minutos. O cache expira naturalmente, sem ser busted por mutações de studyLog.
    // Isso desacopla a atividade de estudo do custo de re-computação do perfil.
    // A tag `user-stats-${userId}` foi REMOVIDA intencionalmente para quebrar a cascata:
    //   recomputeUserStats → revalidateTag(user-stats) → invalida perfil (indesejado).
    { revalidate: 900, tags: [`profile-stats-${userId}`] }
  );

// ── Action pública principal ───────────────────────────────────────────────────
export async function getProfileDataAction(username?: string): Promise<ProfileData> {
  const currentUser = await requireAuth();

  const cacheKey = username ? `username-${username.toLowerCase()}` : `id-${currentUser.id}`;
  const tag = username ? `user-${username.toLowerCase()}` : `user-${currentUser.id}`;
  const targetWhere = username
    ? { profile: { username: { equals: username, mode: "insensitive" as const } } }
    : { id: currentUser.id };

  const userRecord = await unstable_cache(
    async () =>
      prisma.user.findFirst({
        where: targetWhere,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          profile: true,
          _count: { select: { followers: true, following: true } },
          badges: { select: { badgeId: true } },
        },
      }),
    [`user-record-${cacheKey}`],
    { tags: [tag] }
  )();

  if (!userRecord) notFound();

  const isOwner = userRecord.id === currentUser.id;

  // Auto-criação de perfil para usuários legados (sem linha na tabela Profile)
  if (isOwner && !userRecord.profile) {
    const newProfile = await prisma.profile.create({
      data: {
        userId: currentUser.id,
        username: userRecord.email.split("@")[0] + "_" + currentUser.id.slice(0, 4),
        isPublic: true,
      },
    });
    userRecord.profile = newProfile;
  }

  if (!isOwner && !userRecord.profile?.isPublic) notFound();

  // Busca paralela: stats + badges + follow status
  const [statsData, allBadges, isFollowingData] = await Promise.all([
    buildCachedProfileStats(userRecord.id)(),
    getCachedBadges(),
    username && !isOwner
      ? prisma.follows.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUser.id,
              followingId: userRecord.id,
            },
          },
          select: { followingId: true },
        })
      : Promise.resolve(null),
  ]);

  const { heatmap, topSubjects, recentSessions, stats } = statsData;

  const profileUser: ProfileUser = {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    image: userRecord.image,
    createdAt: userRecord.createdAt,
    username: userRecord.profile?.username,
    bio: userRecord.profile?.bio,
    isPublic: userRecord.profile?.isPublic,
    coverImage: userRecord.profile?.coverImage,
    theme: userRecord.profile?.theme ?? "midnight",
    followersCount: userRecord._count.followers,
    followingCount: userRecord._count.following,
  };

  const badges: ProfileBadge[] = allBadges.map((b) => ({
    emoji: b.emoji,
    name: b.name,
    desc: b.description,
    rarity: b.rarity as ProfileBadge["rarity"],
    locked: !userRecord.badges.some((ub) => ub.badgeId === b.id),
  }));

  return {
    user: profileUser,
    stats,
    topSubjects,
    recentSessions,
    heatmap,
    badges,
    isOwner,
    isFollowing: !!isFollowingData,
    friendsRanking: [],
    chartData: [],
  };
}

// ── Atualizar perfil ───────────────────────────────────────────────────────────
export async function updateProfile(data: {
  username?: string;
  bio?: string;
  isPublic?: boolean;
  website?: string;
  name?: string;
  image?: string;
  theme?: string;
  coverImage?: string;
}) {
  const currentUser = await requireAuth();

  const profileData = {
    username: data.username,
    bio: data.bio,
    isPublic: data.isPublic,
    website: data.website,
    theme: data.theme,
    coverImage: data.coverImage,
  };

  const cleanedProfileData = Object.fromEntries(
    Object.entries(profileData).filter(([, v]) => v !== undefined)
  );

  const profile = await prisma.profile.upsert({
    where: { userId: currentUser.id },
    update: cleanedProfileData,
    create: {
      userId: currentUser.id,
      ...cleanedProfileData,
      username: data.username ?? `user_${currentUser.id.slice(0, 8)}`,
    },
  });

  const userData = { name: data.name, image: data.image };
  const cleanedUserData = Object.fromEntries(
    Object.entries(userData).filter(([, v]) => v !== undefined)
  );

  if (Object.keys(cleanedUserData).length > 0) {
    await prisma.user.update({ where: { id: currentUser.id }, data: cleanedUserData });
  }

  // Invalida os caches corretos após edição de perfil
  revalidateTag(`user-${currentUser.id}`, "max");
  if (profile.username) {
    revalidateTag(`user-${profile.username.toLowerCase()}`, "max");
    revalidatePath(`/profile/${profile.username}`);
  }
  revalidatePath("/profile");

  return profile;
}

// ── Buscar amigos (quem o targetUser segue) — Cacheado ───────────────────────
export const getFriends = async ({ targetUserId }: { targetUserId: string }) => {
  return unstable_cache(
    async () =>
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          profile: { select: { username: true } },
        },
        where: { followers: { some: { followerId: targetUserId } } },
      }),
    [`friends-${targetUserId}`],
    { revalidate: 60, tags: [`friends-${targetUserId}`, `user-${targetUserId}`] }
  )();
};
