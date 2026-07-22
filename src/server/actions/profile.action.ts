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
import type { Prisma } from "@/app/generated/prisma/client";


// ── Cache Global Invariável (badges mudam raramente) ────────────────────────
const getCachedBadges = unstable_cache(
  async () => prisma.badge.findMany(),
  ["all-badges-keys"],
  { revalidate: 86400, tags: ["badges"] }
);

// ── Cache de userRecord — extraído como função nomeada (não cria nova closure a cada request)
// Fix: era unstable_cache inline dentro da action → criava instância nova a cada request antes de checar cache.
// Fix: TTL de 5 minutos adicionado (antes ficava preso indefinidamente até tag ser invalidada).
const buildCachedUserRecord = (cacheKey: string, tag: string, targetWhere: Prisma.UserWhereInput) =>
  unstable_cache(
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
    { revalidate: 300, tags: [tag] } // TTL: 5 minutos
  );


// ── Cache das estatísticas do perfil ────────────────────────────────────────
// Queries:
//  1. UserStats     — O(1) PK lookup
//  2. Heatmap       — UserDailyStats já agregado, 6 meses (~183 linhas máx)
//  3. recentLogs    — take:10 com JOIN completo
//  4. topSubjects   — raw SQL: 1 query GROUP BY subjectId, sem remapping em JS
//                     (antes: groupBy topicId + findMany extra para missingTopics)
const buildCachedProfileStats = (userId: string) =>
  unstable_cache(
    async () => {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const sixMonthsAgo = new Date(today.getTime() - 182 * 86400000);
      const todayStr = today.toISOString().split("T")[0];

      // Backfill automático: qualquer perfil visitado (próprio ou de terceiros) sem UserDailyStats
      // tem seus dados agregados aqui antes de prosseguir. É idempotente e ocorre no máximo 1x por usuário.
      const hasDailyStats = await prisma.userDailyStats.findFirst({
        where: { userId },
        select: { id: true },
      });

      if (!hasDailyStats) {
        const dayAggregates = await prisma.studyLogs.groupBy({
          by: ["study_date"],
          where: { topic: { subject: { userId } } },
          _sum: { duration_minutes: true },
          _count: { id: true },
        });

        if (dayAggregates.length > 0) {
          await prisma.userDailyStats.createMany({
            data: dayAggregates.map((a) => ({
              userId,
              date: a.study_date,
              totalMinutes: a._sum.duration_minutes ?? 0,
              sessions: a._count.id,
            })),
            skipDuplicates: true,
          });
        }
      }

      // 4 queries completamente paralelas — zero dependências entre elas
      const [userStats, heatmapRows, recentLogs, rawSubjects] = await Promise.all([
        // 1. Stats desnormalizados — O(1) PK lookup
        prisma.userStats.findUnique({ where: { userId } }),

        // 2. Heatmap — lê UserDailyStats já agregado por dia
        prisma.userDailyStats.findMany({
          where: { userId },
          select: { date: true, totalMinutes: true },
        }),

        // 3. Sessões recentes — take:10 com JOIN, ordenado DESC
        prisma.studyLogs.findMany({
          where: { topic: { subject: { userId } } },
          include: { topic: { include: { subject: true } } },
          orderBy: { start_time: "desc" },
          take: 10,
        }),

        // 4. Top subjects por minutos — 1 raw SQL com GROUP BY subjectId.
        // Fix: era groupBy(topicId) + findMany(missingTopics) + remapping JS.
        // Agora: 1 query agrega direto por matéria, retorna top 5 pronto.
        prisma.$queryRaw<
          Array<{ id: string; name: string; color: string; emoji: string | null; total: bigint }>
        >`
          SELECT s.id, s.name, s.color, s.icon AS emoji, SUM(sl.duration_minutes)::bigint AS total
          FROM "StudyLogs" sl
          JOIN "Topic" t ON t.id = sl."topicId"
          JOIN "Subject" s ON s.id = t."subjectId"
          WHERE s."userId" = ${userId}
            AND sl.study_date >= ${sixMonthsAgo}
            AND sl.study_date <= ${today}
          GROUP BY s.id, s.name, s.color, s.icon
          ORDER BY total DESC
          LIMIT 5
        `,
      ]);

      // ── Heatmap ──────────────────────────────────────────────────────────
      const heatmap: Record<string, number> = {};
      let todayMinutes = 0;

      for (const row of heatmapRows) {
        const dateStr = row.date.toISOString().split("T")[0];
        heatmap[dateStr] = row.totalMinutes;
        if (dateStr === todayStr) todayMinutes = row.totalMinutes;
      }

      // ── Top Subjects — já vem pronto da raw query ─────────────────────
      const topSubjects: ProfileSubject[] = rawSubjects.map((s) => ({
        name: s.name,
        color: s.color,
        emoji: s.emoji ?? "📚",
        minutes: Number(s.total),
      }));

      // ── Sessões recentes ──────────────────────────────────────────────
      const recentSessions: ProfileSession[] = recentLogs.map((log) => ({
        id: log.id,
        subjectName: log.topic.subject.name,
        subjectColor: log.topic.subject.color,
        topicName: log.topic.name,
        duration_minutes: log.duration_minutes,
        start_time: log.start_time,
        study_date: log.study_date,
        notes: log.notes,
      }));

      // ── Stats — fallback zero se usuário ainda não tem registro ──────
      const safeStats = userStats ?? {
        totalMinutes: 0,
        totalSessions: 0,
        studyDays: 0,
        currentStreak: 0,
        longestStreak: 0,
        weeklyMinutes: 0,
      };

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
    // TTL: 15 minutos. Desacoplado de mutações de studyLog (elas invalidam user-stats, não profile-stats).
    { revalidate: 900, tags: [`profile-stats-${userId}`] }
  );

// ── Action pública principal ─────────────────────────────────────────────────
export async function getProfileDataAction(username?: string): Promise<ProfileData> {
  const currentUser = await requireAuth();

  const cacheKey = username ? `username-${username.toLowerCase()}` : `id-${currentUser.id}`;
  const tag = username ? `user-${username.toLowerCase()}` : `user-${currentUser.id}`;
  const targetWhere = username
    ? { profile: { username: { equals: username, mode: "insensitive" as const } } }
    : { id: currentUser.id };

  const userRecord = await buildCachedUserRecord(cacheKey, tag, targetWhere)();

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

// ── Atualizar perfil ─────────────────────────────────────────────────────────
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

  revalidateTag(`user-${currentUser.id}`, "max");
  if (profile.username) {
    revalidateTag(`user-${profile.username.toLowerCase()}`, "max");
    revalidatePath(`/profile/${profile.username}`);
  }
  
  revalidatePath("/profile");

  return profile;
}

// ── Buscar amigos (quem o targetUser segue) — Cacheado ──────────────────────
export const getFriends = async ({ targetUserId }: { targetUserId: string }) => {
  return unstable_cache(
    async () =>
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          image: true,
          profile: { select: { username: true } },
        },
        where: { followers: { some: { followerId: targetUserId } } },
      }),
    [`friends-${targetUserId}`],
    { revalidate: 60, tags: [`friends-${targetUserId}`, `user-${targetUserId}`] }
  )();
};
