import { StudyBlock, SubjectColor, WeekStats } from "./planner";

export const DAY_NAMES = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
export const DAY_SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export const COLOR_MAP: Record<
  SubjectColor,
  { bg: string; text: string; border: string; badge: string }
> = {
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-800 dark:text-emerald-200",
    border: "border-emerald-200 dark:border-emerald-800",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-800 dark:text-blue-200",
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-800 dark:text-amber-200",
    border: "border-amber-200 dark:border-amber-800",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-800 dark:text-rose-200",
    border: "border-rose-200 dark:border-rose-800",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-800 dark:text-violet-200",
    border: "border-violet-200 dark:border-violet-800",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950/40",
    text: "text-orange-800 dark:text-orange-200",
    border: "border-orange-200 dark:border-orange-800",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
  teal: {
    bg: "bg-teal-50 dark:bg-teal-950/40",
    text: "text-teal-800 dark:text-teal-200",
    border: "border-teal-200 dark:border-teal-800",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
  },
  pink: {
    bg: "bg-pink-50 dark:bg-pink-950/40",
    text: "text-pink-800 dark:text-pink-200",
    border: "border-pink-200 dark:border-pink-800",
    badge: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  },
};

export const COLOR_OPTIONS: { value: SubjectColor; label: string; dot: string }[] = [
  { value: "blue",    label: "Azul",    dot: "bg-blue-400" },
  { value: "emerald", label: "Verde",   dot: "bg-emerald-400" },
  { value: "amber",   label: "Âmbar",  dot: "bg-amber-400" },
  { value: "rose",    label: "Rosa",   dot: "bg-rose-400" },
  { value: "violet",  label: "Violeta",dot: "bg-violet-400" },
  { value: "orange",  label: "Laranja",dot: "bg-orange-400" },
  { value: "teal",    label: "Teal",   dot: "bg-teal-400" },
  { value: "pink",    label: "Pink",   dot: "bg-pink-400" },
];

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function blockDurationMinutes(block: StudyBlock): number {
  const diff = timeToMinutes(block.endTime) - timeToMinutes(block.startTime);
  return diff > 0 ? diff : 0;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function computeWeekStats(blocks: StudyBlock[]): WeekStats {
  const totalMinutes = blocks.reduce((acc, b) => acc + blockDurationMinutes(b), 0);
  const completedBlocks = blocks.filter((b) => b.status === "done");
  const completedMinutes = completedBlocks.reduce((acc, b) => acc + blockDurationMinutes(b), 0);
  
  const subjectBreakdown: Record<string, number> = {};
  blocks.forEach((b) => {
    subjectBreakdown[b.subject] = (subjectBreakdown[b.subject] ?? 0) + blockDurationMinutes(b);
  });
  
  return { 
    totalMinutes, 
    totalBlocks: blocks.length, 
    completedMinutes,
    completedBlocks: completedBlocks.length,
    subjectBreakdown 
  };
}

export function getMondayOfCurrentWeek(): Date {
  const dateString = "2026-03-15T03:02:22.279Z";
  const today = new Date(dateString); // Use a fixed date for testing
  console.log("Hoje é:", today);
  const day = today.getDay();
  const diff = today.getDate() - (day === 0 ? 6 : day - 1);
  return new Date(today.setDate(diff));
}

export function getWeekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function generateId(): string {
  return `blk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
