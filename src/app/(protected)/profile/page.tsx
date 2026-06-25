
import { getProfileDataAction } from "@/server/actions/profile.action";
import { ProfileThemeProvider } from "./components/ThemeContext";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { ProfileBanner } from "./components/ProfileBanner";
import { ProfileHeader } from "./components/ProfileHeader";
import { ShowcaseGrid } from "./components/ShowcaseGrid";
import { TopSubjects } from "./components/TopSubjects";
import { StudyHeatmap } from "./components/StudyHeatmap";
import { RecentSessions } from "./components/RecentSessions";
import { AchievementBadges } from "./components/AchievementBadges";
import { Suspense } from "react";
import { ProfileData, Theme } from "./types";

async function MainPage({ data }: { data: ProfileData }) {

  return (
    <main className="mx-auto max-w-5xl px-5 pb-20">
      <Suspense>
        <ProfileHeader user={data.user} stats={data.stats} isOwner={data.isOwner} isFollowing={data.isFollowing} />

        <ShowcaseGrid stats={data.stats} />

        <StudyHeatmap heatmap={data.heatmap} />
        <TopSubjects subjects={data.topSubjects} />

        <RecentSessions sessions={data.recentSessions} />

        <AchievementBadges badges={data.badges} />

      </Suspense>
    </main >
  )
}
// ── Page (RSC) ─────────────────────────────────────────────────────────────────
export default async function ProfilePage() {
  const data = await getProfileDataAction();

  // Dados retornados da action (mock por enquanto — sem tocar no banco real)


  return (
    <ProfileThemeProvider initialTheme={data.user.theme as Theme}>
      {/* Page background */}
      <div className="min-h-screen bg-[#0a0a0f] font-['Inter',sans-serif] text-[#e2e8f0]">
        {/* Floating theme switcher */}

        {/* Banner */}
        <ProfileBanner coverImage={data.user.coverImage} />
        <MainPage data={data} />


      </div>
    </ProfileThemeProvider>
  );
}