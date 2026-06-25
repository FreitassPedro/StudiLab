"use server";

import { requireAuth } from "./requireAuth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function checkIsFollowing(targetUserId: string): Promise<boolean> {
  try {
    const currentUser = await requireAuth();
    if (currentUser.id === targetUserId) return false;

    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUserId,
        },
      },
    });

    return !!follow;
  } catch (e) {
    return false;
  }
}

export async function toggleFollow(targetUserId: string) {
  const currentUser = await requireAuth();

  if (currentUser.id === targetUserId) {
    throw new Error("Você não pode seguir a si mesmo");
  }

  const existingFollow = await prisma.follows.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUser.id,
        followingId: targetUserId,
      },
    },
  });

  if (existingFollow) {
    // Unfollow
    await prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUserId,
        },
      },
    });
  } else {
    // Follow
    await prisma.follows.create({
      data: {
        followerId: currentUser.id,
        followingId: targetUserId,
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/profile/[username]", "page");
  
  return { success: true, isFollowing: !existingFollow };
}

export async function getFollowing() {
  const currentUser = await requireAuth();

  const following = await prisma.follows.findMany({
    where: { followerId: currentUser.id },
    include: {
      following: {
        include: { profile: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return following.map(f => ({
    id: f.following.id,
    name: f.following.name,
    image: f.following.image,
    username: f.following.profile?.username,
  }));
}
