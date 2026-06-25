import { getProfileDataAction } from "@/server/actions/profile.action";
import { ProfileThemeProvider } from "../components/ThemeContext";
import { ThemeSwitcher } from "../components/ThemeSwitcher";
import { ProfileBanner } from "../components/ProfileBanner";
import { ProfileHeader } from "../components/ProfileHeader";
import { ShowcaseGrid } from "../components/ShowcaseGrid";
import { TopSubjects } from "../components/TopSubjects";
import { StudyHeatmap } from "../components/StudyHeatmap";
import { RecentSessions } from "../components/RecentSessions";
import { AchievementBadges } from "../components/AchievementBadges";
import { Suspense } from "react";
import { ProfileData, Theme } from "../types";
import { requireAuth } from "@/server/actions/requireAuth";
import { checkIsFollowing } from "@/server/actions/follow.action";

async function MainPage({ data, isOwner, isFollowing }: { data: ProfileData, isOwner: boolean, isFollowing: boolean }) {
  return (
    <main className="mx-auto max-w-5xl px-5 pb-20">
      <Suspense>
        <ProfileHeader user={data.user} stats={data.stats} isOwner={isOwner} isFollowing={isFollowing} />
        <ShowcaseGrid stats={data.stats} />
        <StudyHeatmap heatmap={data.heatmap} />
        <TopSubjects subjects={data.topSubjects} />
        <RecentSessions sessions={data.recentSessions} />
        <AchievementBadges badges={data.badges} />
      </Suspense>
    </main>
  );
}

// ── Dynamic Page (RSC) ────────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function UsernameProfilePage({ params }: PageProps) {
  const { username } = await params;
  const data = await getProfileDataAction(username);
  const currentUser = await requireAuth();
  const isOwner = currentUser.id === data.user.id;
  const isFollowing = !isOwner ? await checkIsFollowing(data.user.id) : false;

  

  return (
    <ProfileThemeProvider initialTheme={data.user.theme as Theme}>
      {/* Page background */}
      <div className="min-h-screen bg-[#0a0a0f] font-['Inter',sans-serif] text-[#e2e8f0]">
        {/* Banner */}
        <ProfileBanner coverImage={data.user.coverImage} />
        <MainPage data={data} isOwner={isOwner} isFollowing={isFollowing} />
      </div>
    </ProfileThemeProvider>
  );
}
