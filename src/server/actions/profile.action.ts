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

export async function getProfileDataAction(username?: string): Promise<ProfileData> {
  const currentUser = await requireAuth();

  let targetUserId = currentUser.id;

  if (username) {
    const targetProfile = await prisma.profile.findUnique({
      where: { username },
      include: { user: true }
    });

    if (!targetProfile) {
      throw new Error("Perfil não encontrado");
    }
    if (targetProfile.userId !== currentUser.id && !targetProfile.isPublic) {
      throw new Error("Este perfil é privado");
    }
    targetUserId = targetProfile.userId;
  }

  // Fetch User and Profile
  const userRecord = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: {
      profile: true,
      _count: {
        select: { followers: true, following: true }
      }
    }
  });

  if (!userRecord) {
    throw new Error("Usuário não encontrado");
  }

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
    website: userRecord.profile?.website,
    twitter: userRecord.profile?.twitter,
    github: userRecord.profile?.github,
    linkedin: userRecord.profile?.linkedin,
    followersCount: userRecord._count.followers,
    followingCount: userRecord._count.following,
  };

  // Fetch Study Logs
  const studyLogs = await prisma.studyLogs.findMany({
    where: {
      topic: { subject: { userId: targetUserId } }
    },
    include: {
      topic: { include: { subject: true } }
    },
    orderBy: { start_time: "desc" }
  });

  // Calculate Heatmap
  const heatmap: Record<string, number> = {};
  let totalMinutes = 0;
  const uniqueStudyDays = new Set<string>();

  // Basic Stats Calculation
  const subjectMap = new Map<string, { name: string; color: string; minutes: number }>();

  studyLogs.forEach(log => {
    totalMinutes += log.duration_minutes;
    const dateStr = log.study_date.toISOString().split("T")[0];
    heatmap[dateStr] = (heatmap[dateStr] || 0) + log.duration_minutes;
    uniqueStudyDays.add(dateStr);

    const subjectId = log.topic.subject.id;
    if (!subjectMap.has(subjectId)) {
      subjectMap.set(subjectId, {
        name: log.topic.subject.name,
        color: log.topic.subject.color,
        minutes: 0
      });
    }
    subjectMap.get(subjectId)!.minutes += log.duration_minutes;
  });

  // Top Subjects
  const topSubjects: ProfileSubject[] = Array.from(subjectMap.values())
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 5);

  // Recent Sessions
  const recentSessions: ProfileSession[] = studyLogs.slice(0, 10).map(log => ({
    id: log.id,
    subjectName: log.topic.subject.name,
    subjectColor: log.topic.subject.color,
    topicName: log.topic.name,
    duration_minutes: log.duration_minutes,
    start_time: log.start_time,
    study_date: log.study_date,
    notes: log.notes
  }));

  // Streaks (simplified application-level calculation)
  let currentStreakCount = 0;
  const msInDay = 1000 * 60 * 60 * 24;
  const currentDateObj = new Date();
  currentDateObj.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const d = new Date(currentDateObj.getTime() - i * msInDay);
    const dStr = d.toISOString().split("T")[0];
    if (uniqueStudyDays.has(dStr)) {
      currentStreakCount++;
    } else if (i === 0) {
      // It's okay if they haven't studied today yet
    } else {
      break;
    }
  }
  const currentStreak = currentStreakCount;
  const longestStreak = currentStreakCount > 10 ? currentStreakCount : 12; // Placeholder for longest streak

  const stats: ProfileStats = {
    totalMinutes,
    totalSessions: studyLogs.length,
    studyDays: uniqueStudyDays.size,
    currentStreak,
    longestStreak,
    bestWeekMinutes: 0,
    bestWeekLabel: "Última Semana",
    weeklyMinutes: 0,
    avgMinutesPerDay: uniqueStudyDays.size > 0 ? Math.round(totalMinutes / uniqueStudyDays.size) : 0,
  };

  // Badges
  const userBadges = await prisma.userBadge.findMany({
    where: { userId: targetUserId },
    include: { badge: true }
  });

  const allBadges = await prisma.badge.findMany();

  const badges: ProfileBadge[] = allBadges.map(b => ({
    emoji: b.emoji,
    name: b.name,
    desc: b.description,
    rarity: b.rarity as any,
    locked: !userBadges.some(ub => ub.badgeId === b.id)
  }));

  return {
    user: profileUser,
    stats,
    topSubjects,
    recentSessions,
    heatmap,
    badges,
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
  twitter?: string;
  github?: string;
  linkedin?: string;
}) {
  const currentUser = await requireAuth();

  const profile = await prisma.profile.upsert({
    where: { userId: currentUser.id },
    update: data,
    create: {
      userId: currentUser.id,
      ...data,
      username: data.username || `user_${currentUser.id.slice(0, 8)}`
    }
  });

  return profile;
}
