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
export function hexToRgba(hex: string, alpha: number): string {
    const cleanHex = (hex || "#3b82f6").replace('#', '');
    const r = parseInt(cleanHex.slice(0, 2), 16) || 0;
    const g = parseInt(cleanHex.slice(2, 4), 16) || 0;
    const b = parseInt(cleanHex.slice(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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