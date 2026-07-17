import { getDay } from "date-fns";
import { StudyBlock, ColorName } from "./components/mockData";

export function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
}

export function getDayName(date: Date): string {
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    return days[getDay(date)];
}
export const COLOR_MAP: Record<
    ColorName,
    { bg: string; text: string; border: string; badge: string }
> = {
    emerald: {
        bg: "bg-emerald-50 dark:bg-emerald-950/70",
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
        bg: "bg-amber-50 dark:bg-amber-950/70",
        text: "text-amber-800 dark:text-amber-200",
        border: "border-amber-200 dark:border-amber-800",
        badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    },
    rose: {
        bg: "bg-rose-50 dark:bg-rose-950/70",
        text: "text-rose-800 dark:text-rose-200",
        border: "border-rose-200 dark:border-rose-800",
        badge: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
    },
    violet: {
        bg: "bg-violet-50 dark:bg-violet-950/70",
        text: "text-violet-800 dark:text-violet-200",
        border: "border-violet-200 dark:border-violet-800",
        badge: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
    },
    orange: {
        bg: "bg-orange-50 dark:bg-orange-950/70",
        text: "text-orange-800 dark:text-orange-200",
        border: "border-orange-200 dark:border-orange-800",
        badge: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    },
    teal: {
        bg: "bg-teal-50 dark:bg-teal-950/70",
        text: "text-teal-800 dark:text-teal-200",
        border: "border-teal-200 dark:border-teal-800",
        badge: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
    },
    pink: {
        bg: "bg-pink-50 dark:bg-pink-950/70",
        text: "text-pink-800 dark:text-pink-200",
        border: "border-pink-200 dark:border-pink-800",
        badge: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
    },
    cyan: {
        bg: "bg-cyan-50 dark:bg-cyan-950/70",
        text: "text-cyan-800 dark:text-cyan-200",
        border: "border-cyan-200 dark:border-cyan-800",
        badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
    },
    fuchsia: {
        bg: "bg-fuchsia-50 dark:bg-fuchsia-950/70",
        text: "text-fuchsia-800 dark:text-fuchsia-200",
        border: "border-fuchsia-200 dark:border-fuchsia-800",
        badge: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900 dark:text-fuchsia-300",
    },
    lime: {
        bg: "bg-lime-50 dark:bg-lime-950/70",
        text: "text-lime-800 dark:text-lime-200",
        border: "border-lime-200 dark:border-lime-800",
        badge: "bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-300",
    },
    indigo: {
        bg: "bg-indigo-50 dark:bg-indigo-950/70",
        text: "text-indigo-800 dark:text-indigo-200",
        border: "border-indigo-200 dark:border-indigo-800",
        badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
    },
};


export const calculateTop = (startTime: string | Date) => {
    if (!startTime) {
        return 0;
    }

    if (typeof startTime === "string" && startTime.length === 5) {
        startTime = new Date(`1970-01-01T${startTime}:00`);
    }
    const startTimeDate = new Date(startTime);
    if (isNaN(startTimeDate.getTime())) {
        return 0;
    }
    return timeToPosition(startTimeDate);
};

export const timeToPosition = (time: string | Date) => {
    // Extrai hora/minuto/segundo de Date, timestamp ISO ou formato HH:MM
    let hours: number, minutes: number, seconds = 0;

    if (time instanceof Date) {
        hours = time.getHours();
        minutes = time.getMinutes();
        seconds = time.getSeconds();
    } else if (time.includes('T')) {
        // Formato ISO: "2026-02-04T14:00:32.505Z"
        const date = new Date(time);
        hours = date.getHours();
        minutes = date.getMinutes();
        seconds = date.getSeconds();
    } else {
        // Formato HH:MM
        [hours, minutes] = time.split(':').map(Number);
    }

    const totalMinutes = hours * 60 + minutes + (seconds / 60);
    const dayStart = 0 * 60;
    const dayEnd = 24 * 60;
    return ((totalMinutes - dayStart) / (dayEnd - dayStart)) * 100;
};

export const calculateheight = (startTime: Date | string, endTime: Date | string) => {
    if (!startTime) {
        return 0;
    }

    if (!endTime) {
        endTime = new Date();
    }

    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const strtT = start.getTime();
    const endT = end.getTime();
    const durationMs = endT - strtT;
    const durationMinutes = durationMs / (1000 * 60);
    const height = (durationMinutes / (24 * 60)) * 100;
    const minimumHeight = 0.5; // Altura mínima de 0.5% para sessões muito curtas
    if (height < minimumHeight) {
        return minimumHeight;
    } else {
        return Number(Math.min(height, 100 - calculateTop(start)).toFixed(2));
    }
}

const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

export const parseTimeToMinutes = (time: string | Date) => {
    if (time instanceof Date) {
        return time.getHours() * MINUTES_PER_HOUR + time.getMinutes() + time.getSeconds() / 60;
    }

    if (time.includes("T")) {
        const date = new Date(time);
        return date.getHours() * MINUTES_PER_HOUR + date.getMinutes() + date.getSeconds() / 60;
    }

    const [hours, minutes] = time.split(":").map(Number);
    return hours * MINUTES_PER_HOUR + minutes;
};

export const buildHourHeights = (
    blocks: StudyBlock[],
    baseHeightPx = 44,
    occupiedBonusPx = 28,
) => {
    return Array.from({ length: HOURS_PER_DAY }, (_, hour) => {
        const slotStart = hour * MINUTES_PER_HOUR;
        const slotEnd = slotStart + MINUTES_PER_HOUR;

        const hasBlockInSlot = blocks.some((block) => {
            const blockStart = parseTimeToMinutes(block.startTime);
            const blockEnd = parseTimeToMinutes(block.endTime);
            return blockStart < slotEnd && blockEnd > slotStart;
        });

        return baseHeightPx + (hasBlockInSlot ? occupiedBonusPx : 0);
    });
};

export const getTimelinePositionPx = (minutes: number, hourHeights: number[]) => {
    let position = 0;

    for (let hour = 0; hour < HOURS_PER_DAY; hour += 1) {
        const slotStart = hour * MINUTES_PER_HOUR;
        const slotEnd = slotStart + MINUTES_PER_HOUR;
        const slotHeight = hourHeights[hour] ?? hourHeights[hourHeights.length - 1] ?? 0;

        if (minutes >= slotEnd) {
            position += slotHeight;
            continue;
        }

        const progressInSlot = Math.max(0, minutes - slotStart) / MINUTES_PER_HOUR;
        position += slotHeight * progressInSlot;
        return position;
    }

    return position;
};

export const getBlockTimelineMetrics = (
    block: Pick<StudyBlock, "startTime" | "endTime">,
    hourHeights: number[],
) => {
    const startMinutes = parseTimeToMinutes(block.startTime);
    const endMinutes = parseTimeToMinutes(block.endTime);
    const topPx = getTimelinePositionPx(startMinutes, hourHeights);
    const bottomPx = getTimelinePositionPx(endMinutes, hourHeights);

    return {
        topPx,
        heightPx: Math.max(bottomPx - topPx, 20),
    };
};

export function normalizeSubjectName(subject: string): string {
    return subject
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

export function checkTimeOverlap(
    startA: string, endA: string,
    startB: string, endB: string
): boolean {
    const startAMin = parseTimeToMinutes(startA);
    const endAMin = parseTimeToMinutes(endA);
    const startBMin = parseTimeToMinutes(startB);
    const endBMin = parseTimeToMinutes(endB);
    return startAMin < endBMin && endAMin > startBMin;
}