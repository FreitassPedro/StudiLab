// ── Theme ──────────────────────────────────────────────────────────────────────

/* Temas
midnight: roxo escuro
sunset: laranja
sky: azul
delicatessen: rosa
forest: verde
*/
export type Theme = "midnight" | "sunset" | "sky" | "delicatessen" | "forest";

export interface ThemeConfig {
  key: Theme;
  label: string;
  gradient: string;
  tooltip: string;
}

// ── Domain types (aligned with Prisma schema) ──────────────────────────────────

export interface ProfileUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt: Date;
  username?: string | null;
  theme: string;
  bio?: string | null;
  isPublic?: boolean;
  coverImage?: string | null;
  webSite?: string | null;
  linkedin?: string | null;
  followersCount?: number;
  followingCount?: number;
}

export interface ProfileSubject {
  name: string;
  color: string;
  emoji: string,
  minutes: number; // total minutes studied
}

export interface ProfileSession {
  id: string;
  subjectName: string;
  subjectColor: string;
  topicName: string;
  duration_minutes: number;
  start_time: Date;
  study_date: Date;
  notes?: string | null;
}

export type BadgeRarity =
  | "Ultra Rara"
  | "Rara"
  | "Épica"
  | "Incomum"
  | "Lendária"
  | "Mítica";

export interface ProfileBadge {
  emoji: string;
  name: string;
  desc: string;
  rarity: BadgeRarity;
  locked: boolean;
}

export interface ProfileStats {
  totalMinutes: number;
  totalSessions: number;
  studyDays: number;           // unique days with at least one session
  currentStreak: number;       // consecutive days up to today
  longestStreak: number;       // all-time best streak
  bestWeekMinutes: number;     // best 7-day block total
  bestWeekLabel: string;       // e.g. "18 Nov – 24 Nov"
  weeklyMinutes: number;       // current week total (Mon–today)
  avgMinutesPerDay: number;
}

// ── Full profile data returned by the action ──────────────────────────────────

export interface ProfileData {
  user: ProfileUser;
  stats: ProfileStats;
  topSubjects: ProfileSubject[];
  recentSessions: ProfileSession[];
  heatmap: Record<string, number>; // "YYYY-MM-DD" → total minutes
  badges: ProfileBadge[];
}
