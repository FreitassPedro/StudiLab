export type SubjectColor =
  | "emerald"
  | "blue"
  | "amber"
  | "rose"
  | "violet"
  | "orange"
  | "teal"
  | "pink";

export type BlockStatus = "todo" | "done" | "missed" | "in-progress";
export type BlockType = "study" | "revision" | "practice" | "exam";
export type BlockPriority = 1 | 2 | 3; // 1: Low, 2: Medium, 3: High

export interface StudyBlock {
  id: string;
  subject: string;
  topic?: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  color: SubjectColor;
  dayIndex: number;  // 0 = Monday ... 6 = Sunday
  status: BlockStatus;
  type: BlockType;
  priority: BlockPriority;
}

export interface DayData {
  dayIndex: number;
  blocks: StudyBlock[];
}

export interface WeekStats {
  totalMinutes: number;
  totalBlocks: number;
  completedMinutes: number;
  completedBlocks: number;
  subjectBreakdown: Record<string, number>; // subject -> minutes
}
