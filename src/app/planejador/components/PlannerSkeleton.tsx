"use client";

import { cn } from "@/lib/utils";

// ── Skeleton primitives ───────────────────────────────────────────────────────
function Bone({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <div className={cn("animate-pulse rounded-md bg-muted/60", className)} style={style} />
    );
}

// ── Header skeleton ───────────────────────────────────────────────────────────
function HeaderSkeleton() {
    return (
        <header className="flex items-center justify-between px-6 py-3 border-b shrink-0">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <Bone className="w-8 h-8 rounded-xl" />
                    <div className="space-y-1.5">
                        <Bone className="w-20 h-3" />
                        <Bone className="w-12 h-2" />
                    </div>
                </div>
                <div className="h-8 w-px bg-border/50" />
                <Bone className="w-44 h-8 rounded-lg" />
            </div>
            <Bone className="w-28 h-4 rounded-full" />
        </header>
    );
}

// ── Stats bar skeleton ────────────────────────────────────────────────────────
function StatsBarSkeleton() {
    return (
        <div className="flex items-center gap-6 px-6 py-3 border-b shrink-0">
            <Bone className="w-9 h-9 rounded-full" />
            <Bone className="w-16 h-6 rounded" />
            <div className="h-6 w-px bg-border/40" />
            <Bone className="w-20 h-6 rounded" />
            <div className="h-6 w-px bg-border/40" />
            <Bone className="w-20 h-6 rounded" />
            <div className="h-6 w-px bg-border/40 hidden md:block" />
            <div className="hidden md:flex gap-4">
                {[80, 64, 56].map((w, i) => (
                    <Bone key={i} className={`w-${w === 80 ? 20 : w === 64 ? 16 : 14} h-6 rounded`} />
                ))}
            </div>
        </div>
    );
}

// ── Grid skeleton — fake day columns with random blocks ───────────────────────
function GridSkeleton() {
    // Simulate 5 visible days with a few blocks each
    const fakeDays = [
        [{ top: 20, h: 60 }, { top: 100, h: 45 }],
        [{ top: 35, h: 80 }],
        [{ top: 15, h: 50 }, { top: 90, h: 35 }, { top: 145, h: 55 }],
        [{ top: 25, h: 65 }],
        [{ top: 10, h: 40 }, { top: 70, h: 70 }],
        [],
        [],
    ];

    return (
        <div className="flex-1 overflow-hidden">
            <div className="grid px-2 py-2 min-w-[760px]" style={{ gridTemplateColumns: "52px repeat(7, minmax(0, 1fr))" }}>
                {/* Hour labels */}
                <div className="pt-10 space-y-8">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Bone key={i} className="w-8 h-2 ml-auto" />
                    ))}
                </div>

                {/* Day columns */}
                {fakeDays.map((dayBlocks, dayIndex) => (
                    <div key={dayIndex} className="border-l border-border/30 pl-1">
                        {/* Day header */}
                        <div className="h-10 flex flex-col items-center justify-center gap-1 border-b border-border/20 mb-1">
                            <Bone className="w-6 h-2" />
                            <Bone className="w-8 h-3" />
                        </div>
                        {/* Fake blocks */}
                        <div className="relative" style={{ height: "300px" }}>
                            {dayBlocks.map((b, i) => (
                                <div
                                    key={i}
                                    className="absolute left-1 right-1 animate-pulse rounded-md bg-muted/50"
                                    style={{ top: b.top, height: b.h }}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Sidebar skeleton ──────────────────────────────────────────────────────────
function SidebarSkeleton() {
    return (
        <aside className="border-l bg-muted/5 flex flex-col w-64 lg:w-72 shrink-0">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <Bone className="w-32 h-3" />
                <Bone className="w-6 h-6 rounded" />
            </div>

            <div className="p-4 space-y-6 flex-1">
                {/* Add block button */}
                <Bone className="w-full h-9 rounded-lg" />

                {/* Donut + bar chart card */}
                <div className="border rounded-xl p-4 space-y-4">
                    <Bone className="w-16 h-16 rounded-full mx-auto" />
                    <div className="space-y-2">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <Bone key={i} className={`h-4 rounded`} style={{ width: `${40 + (i * 7) % 40}%` }} />
                        ))}
                    </div>
                </div>

                {/* Subject progress */}
                <div className="space-y-3 pt-4 border-t">
                    <Bone className="w-24 h-2" />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Bone className="w-4 h-4 rounded-full" />
                                    <Bone className="w-20 h-2.5" />
                                </div>
                                <Bone className="w-14 h-2" />
                            </div>
                            <Bone className="w-full h-1 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function PlannerSkeleton() {
    return (
        <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
            <HeaderSkeleton />
            <StatsBarSkeleton />
            <div className="flex flex-1 overflow-hidden min-h-0">
                <div className="flex-1 flex flex-col min-w-0 bg-muted/5">
                    <GridSkeleton />
                </div>
                <SidebarSkeleton />
            </div>
        </div>
    );
}
