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
import { recomputeUserStats } from "./userStats.action";

// 1. Cache Global Invariável
const getCachedBadges = unstable_cache(
  async () => await prisma.badge.findMany(),
  ["all-badges-keys"],
  { revalidate: 86400, tags: ["badges"] }
);

const REVALIDATE_TIME = 60 * 60 * 24 * 5;

const getCachedProfileStats = async (targetUserId: string) => {
  return unstable_cache(
    async () => {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const sixMonthsAgo = new Date(today.getTime() - 182 * 86400000);

      // Ler métricas pré-calculadas de UserStats — O(1), uma linha, sem JOINs
      let userStats = await prisma.userStats.findUnique({
        where: { userId: targetUserId },
      });

      if (!userStats) {
        await recomputeUserStats(targetUserId);
        userStats = await prisma.userStats.findUnique({
          where: { userId: targetUserId },
        });
      }

      // Buscar apenas os últimos 6 meses com JOINs — necessário para heatmap, topSubjects e sessões recentes
      const recentLogs = await prisma.studyLogs.findMany({
        where: {
          topic: { subject: { userId: targetUserId } },
          study_date: { gte: sixMonthsAgo, lte: today },
        },
        include: { topic: { include: { subject: true } } },
        orderBy: { start_time: "desc" },
      });

      // Heatmap e top subjects derivados apenas dos últimos 6 meses
      const heatmap: Record<string, number> = {};
      const subjectMap = new Map<string, { name: string; color: string; minutes: number; emoji: string }>();
      let todayMinutes = 0;
      const todayStr = today.toISOString().split("T")[0];

      recentLogs.forEach((log) => {
        const dateStr = log.study_date.toISOString().split("T")[0];
        heatmap[dateStr] = (heatmap[dateStr] || 0) + log.duration_minutes;
        if (dateStr === todayStr) todayMinutes += log.duration_minutes;

        const subjectId = log.topic.subject.id;
        if (!subjectMap.has(subjectId)) {
          subjectMap.set(subjectId, {
            name: log.topic.subject.name,
            color: log.topic.subject.color,
            minutes: 0,
            emoji: log.topic.subject.icon || "📚",
          });
        }
        subjectMap.get(subjectId)!.minutes += log.duration_minutes;
      });

      const topSubjects: ProfileSubject[] = Array.from(subjectMap.values())
        .sort((a, b) => b.minutes - a.minutes)
        .slice(0, 5);

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

      // Montar ProfileStats lendo valores reais de UserStats (nunca hardcoded)
      const stats: ProfileStats = {
        totalMinutes: userStats?.totalMinutes ?? 0,
        totalSessions: userStats?.totalSessions ?? 0,
        studyDays: userStats?.studyDays ?? 0,
        currentStreak: userStats?.currentStreak ?? 0,
        longestStreak: userStats?.longestStreak ?? 0,
        weeklyMinutes: userStats?.weeklyMinutes ?? 0,
        // bestWeekMinutes: futuramente persistir em UserStats via recompute
        // Por ora, usa o total semanal atual como proxy se disponível
        bestWeekMinutes: userStats?.weeklyMinutes ?? 0,
        bestWeekLabel: "Semana Atual",
        avgMinutesPerDay:
          (userStats?.studyDays ?? 0) > 0
            ? Math.round((userStats?.totalMinutes ?? 0) / (userStats?.studyDays ?? 1))
            : 0,
        todayMinutes,
      };

      return { heatmap, topSubjects, recentSessions, stats };
    },
    [`profile-stats-${targetUserId}`],
    { tags: [`profile-stats-${targetUserId}`, `user-stats-${targetUserId}`] }
  )();
};

const getCachedUserRecord = async (username: string | undefined, currentUserId: string) => {
  const cacheKeyStr = username ? `username-${username.toLowerCase()}` : `id-${currentUserId}`;
  const tagStr = username ? `user-${username.toLowerCase()}` : `user-${currentUserId}`;
  return unstable_cache(
    async () => {
      const targetUserWhere = username ? { profile: { username: { equals: username, mode: "insensitive" as const } } } : { id: currentUserId };

      return await prisma.user.findFirst({
        where: targetUserWhere,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          profile: true,
          _count: {
            select: { followers: true, following: true }
          },
          badges: {
            select: { badgeId: true }
          }
        }
      });
    },
    [`user-record-${cacheKeyStr}`],
    { tags: [tagStr] }
  )();
};


export async function getProfileDataAction(username?: string): Promise<ProfileData> {
  const currentUser = await requireAuth();

  // 1. Fetch exactly what we need for the user first (Cached)
  const userRecord = await getCachedUserRecord(username, currentUser.id);

  console.log("userRecord found:", userRecord ? `Yes (id: ${userRecord.id}, hasProfile: ${!!userRecord.profile})` : "No");

  if (!userRecord) {
    console.log("Throwing notFound because userRecord is null!");
    notFound();
  }

  const isOwner = userRecord.id === currentUser.id;
  console.log("isOwner:", isOwner);

  // Auto-create profile for legacy users who signed up before the trigger existed
  if (isOwner && !userRecord.profile) {
    console.log("Auto-creating profile for legacy user:", currentUser.id);
    const newProfile = await prisma.profile.create({
      data: {
        userId: currentUser.id,
        username: userRecord.email.split("@")[0] + "_" + currentUser.id.slice(0, 4),
        isPublic: true,
      }
    });
    userRecord.profile = newProfile;
    console.log("Profile created:", newProfile.username);
  }

  if (!isOwner && !userRecord.profile?.isPublic) {
    console.log("Throwing notFound because not owner and not public");
    notFound();
  }

  // 2. Fetch dependencies using the precise target user ID (much faster, cached)
  const [statsData, allBadges, isFollowingData] = await Promise.all([
    getCachedProfileStats(userRecord.id),
    getCachedBadges(),
    username && !isOwner ? prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: userRecord.id
        }
      },
      select: { followingId: true } // Otimização de payload do SGBD
    }) : Promise.resolve(null)
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
    theme: userRecord.profile?.theme || "midnight",
    followersCount: userRecord._count.followers,
    followingCount: userRecord._count.following,
  };

  // Badges
  const badges: ProfileBadge[] = allBadges.map(b => ({
    emoji: b.emoji, name: b.name, desc: b.description, rarity: b.rarity as any,
    locked: !userRecord.badges.some(ub => ub.badgeId === b.id)
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

export async function toggleFollowUser(targetUserId: string) {
  const currentUser = await requireAuth();

  if (currentUser.id === targetUserId) {
    throw new Error("Você não pode seguir a si mesmo");
  }

  const existingFollow = await prisma.follows.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUser.id,
        followingId: targetUserId
      }
    }
  });

  if (existingFollow) {
    await prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUserId
        }
      }
    });
    return { followed: false };
  } else {
    await prisma.follows.create({
      data: {
        followerId: currentUser.id,
        followingId: targetUserId
      }
    });
    return { followed: true };
  }
}

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
    Object.entries(profileData).filter(([_, v]) => v !== undefined)
  );

  const profile = await prisma.profile.upsert({
    where: { userId: currentUser.id },
    update: cleanedProfileData,
    create: {
      userId: currentUser.id,
      ...cleanedProfileData,
      username: data.username || `user_${currentUser.id.slice(0, 8)}`
    }
  });

  const userData = {
    name: data.name,
    image: data.image,
  };

  const cleanedUserData = Object.fromEntries(
    Object.entries(userData).filter(([_, v]) => v !== undefined)
  );

  if (Object.keys(cleanedUserData).length > 0) {
    await prisma.user.update({
      where: { id: currentUser.id },
      data: cleanedUserData
    });
  }

  revalidateTag(`user-${currentUser.id}`, {
    expire: REVALIDATE_TIME
  });

  if (profile.username) {
    revalidateTag(`user-${profile.username.toLowerCase()}`, {
      expire: REVALIDATE_TIME
    });
    revalidatePath(`/profile/${profile.username}`);
  }
  revalidatePath('/profile');

  return profile;
}


export const getFriends = async ({ targetUserId }: { targetUserId: string }) => {
  const data = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      profile: {
        select: {
          username: true
        }
      }
    },
    where: {
      followers: {
        some: {
          followerId: targetUserId,
        },
      },
    },
  });

  console.log(data);
  return data;
}