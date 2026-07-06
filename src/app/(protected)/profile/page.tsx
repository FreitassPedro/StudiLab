
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
import { getCurrentUser } from "@/server/actions/getCurrentUser";
import { redirect } from "next/navigation";

// ── Page (RSC) ─────────────────────────────────────────────────────────────────
export default async function ProfilePage() {

    const user = await getCurrentUser();

    if (user) {
        redirect(`/profile/${user.name}`)
    }

    return null;


}