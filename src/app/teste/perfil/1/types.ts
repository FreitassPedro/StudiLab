export type Theme = "cyberpunk" | "lofi" | "minimal";

export interface ThemeConfig {
  key: Theme;
  label: string;
  gradient: string;
  tooltip: string;
}

export interface Subject {
  emoji: string;
  name: string;
  sub: string;
  hours: number;
  color: string;
}

export interface Session {
  emoji: string;
  subject: string;
  duration: string;
  time: string;
  note: string;
  color: string;
}

export type BadgeRarity =
  | "Ultra Rara"
  | "Rara"
  | "Épica"
  | "Incomum"
  | "Lendária"
  | "Mítica";

export interface Badge {
  emoji: string;
  name: string;
  desc: string;
  rarity: BadgeRarity;
  locked: boolean;
}

export interface ShelfItem {
  emoji: string;
  title: string;
  sub: string;
  type: string;
  progress: number | null;
}

export interface UserProfile {
  name: string;
  username: string;
  avatarEmoji: string;
  tier: string;
  status: string;
  statusEmoji: string;
  totalHours: string;
  consistency: string;
  daysRecorded: string;
  goalEmoji: string;
  goalText: string;
  quote: string;
  quoteLabel: string;
}

export interface ShowcaseItem {
  type: "streak" | "badge" | "week" | "weekgoal";
}
