"use client";

import { ProfileThemeProvider } from "./components/ThemeContext";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { ProfileBanner } from "./components/ProfileBanner";
import { ProfileHeader } from "./components/ProfileHeader";
import { QuoteCard } from "./components/QuoteCard";
import { ShowcaseGrid } from "./components/ShowcaseGrid";
import { TopSubjects } from "./components/TopSubjects";
import { StudyHeatmap } from "./components/StudyHeatmap";
import { RecentSessions } from "./components/RecentSessions";
import { AchievementBadges } from "./components/AchievementBadges";
import { ResourceShelf } from "./components/ResourceShelf";
import { MOCK_USER } from "./mock-data";

// ── Profile page footer ──
function ProfileFooter({ name }: { name: string }) {
  return (
    <footer className="border-t border-white/[0.05] pt-5 text-center">
      <p className="text-xs text-white/20">
        Monitor de Estudos · Perfil público de {name}
      </p>
    </footer>
  );
}

// ── Page ──
export default function ProfilePage() {
  return (
    <ProfileThemeProvider>
      {/* Page background */}
      <div className="min-h-screen bg-[#0a0a0f] font-['Inter',sans-serif] text-[#e2e8f0]">

        {/* Floating theme switcher */}
        <ThemeSwitcher />

        {/* Banner */}
        {/* <ProfileBanner /> */}

        {/* Main content */}
        <main className="mx-auto max-w-[900px] px-5 pb-20">
          <ProfileHeader user={MOCK_USER} />

          <QuoteCard quote={MOCK_USER.quote} label={MOCK_USER.quoteLabel} />

          <ShowcaseGrid />

          <TopSubjects />

          <StudyHeatmap />

          <RecentSessions />

          <AchievementBadges />

          <ResourceShelf />

          <ProfileFooter name={MOCK_USER.name} />
        </main>
      </div>
    </ProfileThemeProvider>
  );
}