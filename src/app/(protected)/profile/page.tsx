
import { getProfileDataAction } from "@/server/actions/profile.action";
import { ProfileThemeProvider } from "./components/ThemeContext";
import { ProfileBanner } from "./components/ProfileBanner";
import { ProfileHeader } from "./components/ProfileHeader";
import { ShowcaseGrid } from "./components/ShowcaseGrid";
import { TopSubjects } from "./components/TopSubjects";
import { StudyHeatmap } from "./components/StudyHeatmap";
import { RecentSessions } from "./components/RecentSessions";
import { AchievementBadges } from "./components/AchievementBadges";
import { ObjectiveCard } from "./components/ObjectiveCard";
import { FriendsRanking } from "./components/FriendsRanking";
import { StudyCharts } from "./components/StudyCharts";
import { SocialActivity } from "./components/SocialActivity";
import { Suspense } from "react";
import { ProfileData, Theme } from "./types";

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

// ── Page (RSC) ─────────────────────────────────────────────────────────────────
export default async function ProfilePage() {
  const data = await getProfileDataAction();

  // ── Mock data ────────────────────────────────────────────────────────────────
  data.stats.todayMinutes = 150;
  data.friendsRanking = [
    { id: "1", name: "Ana Silva", username: "anasilva", minutes: 320 },
    { id: "2", name: "Carlos Edu", username: "carlosedu", minutes: 210 },
    { id: "3", name: "Você", username: data.user.username || "voce", minutes: 150, image: data.user.image || undefined },
    { id: "4", name: "Maria Clara", username: "mariac", minutes: 45 },
  ];
  data.chartData = [
    { name: "Seg", minutes: 120 },
    { name: "Ter", minutes: 180 },
    { name: "Qua", minutes: 150 },
    { name: "Qui", minutes: 210 },
    { name: "Sex", minutes: 90 },
    { name: "Sáb", minutes: 240 },
    { name: "Dom", minutes: 150 },
  ];
  data.objective = {
    name: "ENEM 2026",
    date: "03 Nov 2026",
    daysLeft: 129,
  };

  return (
    <ProfileThemeProvider initialTheme={data.user.theme as Theme}>
      <div className="min-h-screen bg-background font-['Inter',sans-serif] text-foreground">
        <ProfileBanner coverImage={data.user.coverImage} />
        <MainPage data={data} />
      </div>
    </ProfileThemeProvider>
  );
}