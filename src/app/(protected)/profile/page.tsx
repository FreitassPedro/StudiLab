import { getProfileDataAction } from "@/server/actions/profile.action";
import { redirect } from "next/navigation";

// ── Page (RSC) ─────────────────────────────────────────────────────────────────
export default async function ProfilePage() {
    // getProfileDataAction() fetches the current user's profile and auto-creates it if missing.
    const profileData = await getProfileDataAction();

    const username = profileData?.user?.username;

    if (username) {
        redirect(`/profile/${username}`);
    }

    return null;
}