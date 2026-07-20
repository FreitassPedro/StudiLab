"use client";

import { Suspense, useRef, memo } from "react";
import { cn } from "@/lib/utils";
import { DayColumn } from "./DayColumn";
import { StudyBlock } from "../types";

function formatHourLabel(hour: number) {
    return `${String(hour).padStart(2, "0")}:00`;
}

interface PlannerGridProps {
    weekDates: Date[];
    blocksByDay: StudyBlock[][];
    hourHeights: number[];
    timelineHeightPx: number;
    hourOffsets: number[];
    timelineRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

export const PlannerGrid = memo(function PlannerGrid({
    weekDates,
    blocksByDay,
    hourHeights,
    timelineHeightPx,
    hourOffsets,
    timelineRefs,
}: PlannerGridProps) {
    const gridRef = useRef<HTMLDivElement>(null);

    return (
        <div className="flex-1 overflow-auto" id="planner-scroll-container">
            <div
                ref={gridRef}
                className="grid px-2 py-2 min-w-[760px]"
                style={{ gridTemplateColumns: "52px repeat(7, minmax(0, 1fr))" }}
            >
                {/* Hour labels — every 1h */}
                <div className="flex flex-col min-w-0 pt-10">
                    <div
                        className="relative"
                        style={{ height: `${timelineHeightPx}px` }}
                    >
                        {hourOffsets.map((top, hour) =>
                            hour % 1 === 0 ? (
                                <div
                                    key={hour}
                                    className="absolute right-2 flex items-center"
                                    style={{ top: `${top}px` }}
                                >
                                    <span className={cn(
                                        "tabular-nums",
                                        hour % 6 === 0
                                            ? "text-foreground/50 text-[11px] font-semibold"
                                            : "text-muted-foreground/30 text-[10px]"
                                    )}>
                                        {formatHourLabel(hour)}
                                    </span>
                                </div>
                            ) : null
                        )}
                    </div>
                </div>

                {/* Day columns */}
                <Suspense fallback={<div />}>
                    {weekDates.map((date, dayIndex) => (
                        <div key={dayIndex} className={cn("border-l border-border/30 pl-1", dayIndex === 6 && "border-r pr-1")}>
                            <DayColumn
                                blocks={blocksByDay[dayIndex]}
                                date={date}
                                dayIndex={dayIndex}
                                hourHeights={hourHeights}
                                timelineHeightPx={timelineHeightPx}
                                timelineRef={(el) => { timelineRefs.current[dayIndex] = el; }}
                            />
                        </div>
                    ))}
                </Suspense>
            </div>
        </div>
    );
});
