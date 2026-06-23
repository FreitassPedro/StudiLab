"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData, useDashboardSubjectsMap, useDashboardTopicsMap } from "@/hooks/useDashboard";
import useSessionFormStore from "@/store/useSessionFormStore";
import useCronometerStore from "@/store/useCronometerStore";
import { Clock } from "lucide-react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getTodayLocal } from "@/lib/utils";

const TimelineCardProps = {
    height: "72rem",
}

type TimelineLog = {
    id: string;
    topic: {
        name: string;
        subjectId: string;
    };
    start_time: Date | string;
    end_time: Date | string;
};

type TimelineSubject = {
    name?: string;
    color?: string;
};

type TimelineNowContextValue = {
    currentTime: Date;
};

const TimelineNowContext = createContext<TimelineNowContextValue | null>(null);

function useTimelineNow() {
    const context = useContext(TimelineNowContext);
    if (!context) {
        throw new Error("useTimelineNow must be used within TimelineNowContext.Provider");
    }
    return context;
}

const timeToPosition = (time: string | Date) => {
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

const calculateTop = (startTime: Date | string) => {
    if (!startTime) {
        return 0;
    }
    const startTimeDate = new Date(startTime);
    if (isNaN(startTimeDate.getTime())) {
        return 0;
    }
    return timeToPosition(startTimeDate);
};

const calculateFinalHeight = (startTime: Date | string, endTime: Date | string) => {
    if (!startTime) {
        return 0;
    }

    if (!endTime) {
        endTime = new Date();
    }
    const start = new Date(startTime);
    const end = new Date(endTime);
    const strtT = start.getTime();
    const endT = end.getTime();
    const durationMs = endT - strtT;
    const durationMinutes = durationMs / (1000 * 60);
    const height = (durationMinutes / (24 * 60)) * 100;


    const minimumHeight = 0.5; // Altura mínima de 0.5% para sessões muito curtas
    if (height < minimumHeight) {
        return minimumHeight;
    } else {
        return Math.min(height, 100 - calculateTop(start)).toFixed(2);
    }
}

const formatTimeFromTimestamp = (time: Date | string | undefined | null, includeSeconds = false) => {
    if (!time) return '--:--';
    const timeDate = typeof time === 'string' ? new Date(time) : time;
    if (isNaN(timeDate.getTime())) return '--:--';
    const hours = timeDate.getHours().toString().padStart(2, '0');
    const minutes = timeDate.getMinutes().toString().padStart(2, '0');
    const seconds = timeDate.getSeconds().toString().padStart(2, '0');

    if (includeSeconds) {
        return `${hours}:${minutes}:${seconds}`;
    }

    return `${hours}:${minutes}`;
};


const RenderCurrentSessionCard = ({
    startTime,
    endTime,
    isRunning,
    topicName,
    subjectName,
    subjectColor,
}: {
    startTime: Date | null;
    endTime: Date | null;
    isRunning: boolean;
    topicName: string;
    subjectName: string;
    subjectColor?: string;
}) => {
    const { currentTime } = useTimelineNow();

    const resolvedBorderColor = subjectColor ?? '#a1a1aa';


    const currentCard = useMemo(() => {
        if (!startTime) return null;

        const resolvedEndTime = isRunning
            ? currentTime
            : (endTime ? new Date(endTime) : currentTime);

        return {
            startTime,
            endTime: resolvedEndTime,
            top: calculateTop(startTime),
            height: calculateFinalHeight(startTime, resolvedEndTime),
        };
    }, [startTime, endTime, isRunning, currentTime]);

    if (!currentCard?.startTime || !currentCard?.endTime) return null;

    return (
        <div
            key={(subjectName || "pendingId") + '_current'}
            className={`absolute z-10 left-2 right-2 rounded-lg p-2 border-l-4 overflow-hidden cursor-pointer hover:scale-[1.01] hover:z-20
            ${isRunning ? 'border-red-500 border-b border-dotted' : 'border-green-500'}
    `}
            style={{
                top: `${currentCard.top}%`,
                height: `${currentCard.height}%`,
                backgroundColor: `${resolvedBorderColor}33`,
                borderLeftColor: `${resolvedBorderColor}`,
            }}
        >
            <div className="flex justify-between h-full">
                <div className="flex flex-col items-center justify-between gap-1">
                    <h4 className="font-semibold text-xs text-foreground truncate">{topicName}</h4>
                    <span className="text-xs text-foreground truncate">{subjectName}</span>
                </div>
                <div className="text-xs text-foreground flex items-center gap-1 flex-row justify-between">
                    <div className='flex flex-row items-center gap-1'>
                        <Clock className="w-3 h-3" />
                        {formatTimeFromTimestamp(currentCard?.startTime)}
                    </div>
                    <div className='flex flex-row items-center gap-1'>
                        <Clock className="w-3 h-3" />
                        {formatTimeFromTimestamp(currentCard?.endTime)}
                    </div>
                </div>
            </div>
        </div>
    );
}

const RenderLogCardItem = ({ log, subject }: { log: TimelineLog; subject?: TimelineSubject }) => {
    return (
        <div
            key={log.id}
            className="absolute z-0 left-2 right-2 rounded-lg p-2 border-l-4 overflow-hidden cursor-pointer hover:scale-[1.01] hover:z-20 transition-all
                                    border-blue-500"
            style={{
                top: `${calculateTop(log.start_time)}%`,
                height: `${calculateFinalHeight(log.start_time, log.end_time)}%`,
                backgroundColor: `${subject?.color}33`,
                borderLeftColor: `${subject?.color}`,
            }}
        >
            <div className="flex justify-between h-full">
                <div>
                    <h4 className="font-semibold text-xs text-foreground truncate">{log.topic?.name}</h4>
                    <span className="text-xs text-muted-foreground truncate">{subject?.name}</span>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1  flex-row justify-between">
                    <div className='flex flex-row items-center gap-1'>
                        <Clock className="w-3 h-3" />
                        {formatTimeFromTimestamp(log.start_time)}
                    </div>
                    <div className='flex flex-row items-center gap-1'>
                        <Clock className="w-3 h-3" />
                        {formatTimeFromTimestamp(log.end_time)}
                    </div>
                </div>
            </div>
        </div>
    );
};

const RenderLogsCard = ({
    logs,
    subjectsMap,
    isLoading,
}: {
    logs?: TimelineLog[];
    subjectsMap?: Record<string, TimelineSubject>;
    isLoading: boolean;
}) => {

    const renderedLogCards = useMemo(() => {
        if (!logs || logs.length === 0) return null;

        return logs.map((log) => (
            <RenderLogCardItem key={log.id} log={log} subject={subjectsMap?.[log.topic.subjectId]} />
        ));
    }, [logs, subjectsMap]);

    if (isLoading && (!logs || logs.length === 0)) {
        return (
            <div>
                <div className="absolute left-2 right-2 top-[20%] h-[4%] rounded-lg bg-muted/40 animate-pulse duration-300" />
                <div className="absolute left-2 right-2 top-[36%] h-[5%] rounded-lg bg-muted/30 animate-pulse duration-300" />
                <div className="absolute left-2 right-2 top-[57%] h-[3.5%] rounded-lg bg-muted/20 animate-pulse duration-300" />
            </div>
        );
    }

    if (!logs || logs.length === 0) {
        return (
            <div className="absolute inset-0 flex items-center justify-center text-center px-6">
                <p className="text-sm text-muted-foreground">
                    Ainda não há sessões registradas para hoje.
                </p>
            </div>
        );
    }

    return (
        <>{renderedLogCards}</>
    )
};

const NowLine = () => {
    const { currentTime } = useTimelineNow();

    return (
        <div
            className="absolute left-0 right-0 h-0.5 bg-red-500 z-20 flex items-center"
            style={{
                top: `${timeToPosition(currentTime)}%`
            }}
        >
            <div className="absolute -left-1 w-2 h-2 bg-red-500 rounded-full"></div>
            <div className="absolute -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="absolute -top-5 left-2 text-xs font-semibold text-red-500 bg-white px-1 rounded" suppressHydrationWarning>
                {formatTimeFromTimestamp(currentTime)}
            </span>
        </div>
    )
}

const RealtimeTimelineLayer = ({
    startTime,
    endTime,
    isRunning,
    topicName,
    subjectName,
    subjectColor,
}: {
    startTime: Date | null;
    endTime: Date | null;
    isRunning: boolean;
    topicName: string;
    subjectName: string;
    subjectColor?: string;
}) => {
    // Deterministic first render to prevent SSR/client hydration mismatch.
    const [currentTime, setCurrentTime] = useState(() => new Date(2000, 0, 1, 12, 0, 0));

    useEffect(() => {
        const updateCurrentTime = () => {
            setCurrentTime(new Date());
        };

        updateCurrentTime();

        const intervalMs = isRunning ? 10_000 : 60_000;
        const intervalId = setInterval(updateCurrentTime, intervalMs);

        return () => clearInterval(intervalId);
    }, [isRunning]);

    const nowContextValue = useMemo(() => ({ currentTime }), [currentTime]);

    return (
        <TimelineNowContext.Provider value={nowContextValue}>
            <RenderCurrentSessionCard
                startTime={startTime}
                endTime={endTime}
                isRunning={isRunning}
                topicName={topicName}
                subjectName={subjectName}
                subjectColor={subjectColor}
            />
            <NowLine />
        </TimelineNowContext.Provider>
    );
};

export function TodayTimeline() {

    const today = getTodayLocal();

    const { data: dashboardData, isLoading: isDashboardLoading } = useDashboardData();
    const logs = dashboardData?.logs;
    const subjects = dashboardData?.subjects;
    const topicsMap = dashboardData?.topicsMap || {};

    // Transform subjects list to map for easier access
    const subjectsMap = useMemo(() => {
        if (!subjects) return {};
        const map: Record<string, TimelineSubject> = {};
        subjects.forEach(s => {
            map[s.id] = { name: s.name, color: s.color };
        });
        return map;
    }, [subjects]);

    const isLogsLoading = isDashboardLoading;
    const isSubjectsLoading = isDashboardLoading;

    const currentStartTime = useCronometerStore((state) => state.cronometer.startTime);
    const currentEndTime = useCronometerStore((state) => state.cronometer.endTime);
    const isCurrentSessionRunning = useCronometerStore((state) => state.cronometer.isRunning);

    const formSubjectId = useSessionFormStore((state) => state.form.subjectId);
    const formTopicId = useSessionFormStore((state) => state.form.topicId);

    const currentSubject = formSubjectId ? subjectsMap?.[formSubjectId] : undefined;
    const currentTopic = formTopicId ? topicsMap[formTopicId] : undefined;

    return (
        <div className="h-auto md:h-full md:min-h-0 md:overflow-hidden">
            <Card className="h-auto md:flex md:h-full md:min-h-0 md:flex-col md:overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-violet-500" />
                        <span suppressHydrationWarning>
                            Timeline do Dia - {today?.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                        </span>
                    </CardTitle>
                    <CardDescription>
                        Visualize suas sessões de estudo ao longo do dia. A linha do tempo é atualizada em tempo real enquanto o cronômetro estiver ativo.
                    </CardDescription>
                </CardHeader>
                <CardContent className="overflow-visible md:flex-1 md:min-h-0 md:overflow-y-auto">
                    <div className="">
                        <div className={`flex flex-row`} style={{ height: TimelineCardProps.height }}>
                            {/* Hour markers */}
                            <div className="flex flex-col text-xs  text-slate-500 space-y-0 sticky left-0 bg-card z-10" >
                                {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                                    <div key={hour} className="flex-1 text-right pr-2 border-r border-slate-200">
                                        {`${hour.toString().padStart(2, '0')}:00`}
                                    </div>
                                ))}
                            </div>

                            {/* Timeline container */}
                            <div className="relative w-full bg-secondary rounded-lg overflow-hidden">
                                {/* Background lines */}
                                {Array.from({ length: 24 }, (_, i) => i + 1).map(hour => (
                                    <div
                                        key={hour}
                                        className="absolute left-0  right-0 border-t border-slate-200/40"
                                        style={{ top: `${(hour / 24) * 100}%` }}
                                    />
                                ))}


                                <RenderLogsCard
                                    logs={logs}
                                    subjectsMap={subjectsMap}
                                    isLoading={isLogsLoading || isSubjectsLoading}
                                />

                                <RealtimeTimelineLayer
                                    startTime={currentStartTime}
                                    endTime={currentEndTime}
                                    isRunning={isCurrentSessionRunning}
                                    topicName={currentTopic?.name ?? 'Topic not selected'}
                                    subjectName={currentSubject?.name ?? 'Subject not selected'}
                                    subjectColor={currentSubject?.color}
                                />

                            </div>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}