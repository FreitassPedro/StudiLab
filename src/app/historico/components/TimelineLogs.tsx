"use client";

import { Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isSameDay } from "date-fns";
import { useStudyLogsRange } from "@/hooks/useStudyLogs";
import useSearchRangeStore from "@/store/useSearchRangeStore";
import { useEffect, useRef } from "react";


const formatTimeFromTimestamp = (time: Date | string) => {
    const timeDate = typeof time === 'string' ? new Date(time) : time;
    const hours = timeDate.getHours().toString().padStart(2, '0');
    const minutes = timeDate.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
};


const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const timeToPosition = (time: string) => {
    // Extrai hora e minuto do timestamp ISO ou formato HH:MM
    let hours: number, minutes: number;

    if (time.includes('T')) {
        // Formato ISO: "2026-02-04T14:00:32.505Z"
        const date = new Date(time);
        hours = date.getHours();
        minutes = date.getMinutes();
    } else {
        // Formato HH:MM
        [hours, minutes] = time.split(':').map(Number);
    }

    const totalMinutes = hours * 60 + minutes;
    const dayStart = 0 * 60;
    const dayEnd = 24 * 60;
    return ((totalMinutes - dayStart) / (dayEnd - dayStart)) * 100;
};



const TimelineCardProps = {
    height: "72rem",
    spaceBetweenDays: "4rem",

}

export function TimelineLogs() {
    const { startDate, endDate, rangeType } = useSearchRangeStore();
    const range = { startDate, endDate };
    const isSingleDay = range && isSameDay(range.startDate, range.endDate);

    const { data: logs, isLoading } = useStudyLogsRange(range.startDate, range.endDate);
    const latestLogRef = useRef<HTMLDivElement>(null);

    // Scroll to the log with latest end_time when logs are loaded

    if (!isSingleDay || rangeType !== "day") return null;

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-10">
                    <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
                </CardContent>
            </Card>
        );
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-violet-500" />
                    Timeline do Dia - {range.startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                </CardTitle>
                <CardDescription>
                    {logs && logs.length > 0
                        ? `${logs.length} sessões • ${formatTime(logs.reduce((sum, log) => sum + log.duration_minutes, 0))} total`
                        : 'Nenhuma sessão de estudo registrada neste dia'
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                {logs && logs.length > 0 && (
                    <div className={`flex flex-row`} style={{ height: TimelineCardProps.height }}>
                        {/* Hour markers */}
                        <div className="flex flex-col text-xs text-slate-500 space-y-0" >
                            {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                                <div key={hour} className="flex-1 text-right pr-2 border-r border-slate-200">
                                    {`${hour.toString().padStart(2, '0')}:00`}
                                </div>
                            ))}
                        </div>

                        {/* Timeline container */}
                        <div className="relative w-full bg-slate-50 rounded-lg overflow-hidden">
                            {/* Background lines */}
                            {Array.from({ length: 24 }, (_, i) => i + 1).map(hour => (
                                <div
                                    key={hour}
                                    className="absolute left-0 right-0 border-t border-slate-200"
                                    style={{ top: `${(hour / 24) * 100}%` }}
                                />
                            ))}

                            {/* Study session blocks */}
                            {logs.map((dayLog) => {
                                const startTimeDate = new Date(dayLog.start_time);
                                const top = timeToPosition(startTimeDate.getHours().toString().padStart(2, '0') + ':' + startTimeDate.getMinutes().toString().padStart(2, '0'));
                                // Calculate height based on duration
                                const height = (dayLog.duration_minutes / (24 * 60)) * 100;

                                // Prevent card from overflowing container
                                const finalHeight = Math.min(height, 100 - top);

                                const subject = dayLog.topic?.subject ?? null;


                                return (
                                    <div
                                        key={dayLog.id}
                                        className="absolute z-10 left-2 right-2 rounded-lg p-2 border-l-4 overflow-hidden cursor-pointer hover:scale-[1.01] hover:z-20 transition-all duration-200"
                                        style={{
                                            top: `${top}%`,
                                            height: `${finalHeight}%`,
                                            backgroundColor: subject ? `${subject.color}10` : '#a1a1aa33',
                                            borderLeftColor: subject ? `${subject.color}` : '#a1a1aa',
                                        }}
                                    >
                                        <div className="flex justify-between h-full">
                                            <div>
                                                <h4 className="font-semibold text-xs text-slate-900 truncate">{dayLog.topic?.name}</h4>
                                                <span className="text-xs text-slate-600 truncate">{subject?.name}</span>
                                            </div>
                                            <div className="text-xs text-slate-600 flex items-center gap-1  flex-row justify-between">
                                                <div className='flex flex-row items-center gap-1'>
                                                    <Clock className="w-3 h-3" />
                                                    {formatTimeFromTimestamp(dayLog.start_time)}
                                                </div>
                                                <div className='flex flex-row items-center gap-1'>
                                                    <Clock className="w-3 h-3" />
                                                    {formatTimeFromTimestamp(dayLog.end_time)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );

}