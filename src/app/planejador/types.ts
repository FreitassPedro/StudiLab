// Types for the study planner
export type BlockType = "leiture" | "revision" | "exercise" | "resume" | "exam";

export interface StudyBlock {
    id: string;
    subjectId: string;
    topic?: string;
    type?: BlockType;
    startTime: string; // "HH:MM"
    endTime: string;   // "HH:MM"
    color: ColorName;
    dayIndex: number; // 0=Monday, ..., 6=Sunday, -1=backlog
    status: "todo" | "done";
    isLog?: boolean;
    logId?: string;
}

export interface Subject {
    id: string;
    name: string;
    color: ColorName;
    isVisible: boolean;
}

export type ColorName =
    | "blue"
    | "amber"
    | "rose"
    | "teal"
    | "emerald"
    | "violet"
    | "orange"
    | "pink"
    | "cyan"
    | "fuchsia"
    | "lime"
    | "indigo";
