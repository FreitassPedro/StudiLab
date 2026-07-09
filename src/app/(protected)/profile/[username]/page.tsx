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
import { StudyCharts } from "../components/StudyCharts";
import { FriendsRanking } from "../components/FriendsRanking";

async function MainPage({ data }: { data: ProfileData }) {
  return (
    <main className="mx-auto max-w-5xl px-5 pb-24">
      <Suspense>
        {/* Header */}
        <ProfileHeader
          user={data.user}
          stats={data.stats}
          isOwner={data.isOwner}
          isFollowing={data.isFollowing}
        />

        {/* Stats vitrine */}
        <ShowcaseGrid stats={data.stats} />

        {/* Main grid — 2/3 + 1/3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

          {/* Left column: charts, heatmap, matérias, sessões */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <StudyHeatmap heatmap={data.heatmap} />
            <StudyCharts data={data.chartData} />
            <TopSubjects subjects={data.topSubjects} />
            <RecentSessions sessions={data.recentSessions} />
          </div>

          {/* Right column: objective, ranking, social feed, badges */}
          <div className="flex flex-col gap-6">
            {/* <ObjectiveCard objective={data.objective} /> */}
            <FriendsRanking ranking={data.friendsRanking} />

            {/* <SocialActivity /> */}
            <AchievementBadges badges={data.badges} />
          </div>
        </div>
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

  
  return (
    <ProfileThemeProvider initialTheme={data.user.theme as Theme}>
      {/* Page background */}
      <div className="min-h-screen bg-background font-['Inter',sans-serif] text-foreground">
        {/* Banner */}
        <ProfileBanner coverImage={data.user.coverImage} />
        <MainPage data={data} />
      </div>
    </ProfileThemeProvider>
  );
}
