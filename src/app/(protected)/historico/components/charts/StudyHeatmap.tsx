"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useActivityAnalysis } from '@/hooks/useActivity';
import useSearchRangeStore, { RangeType } from '@/store/useSearchRangeStore';


import { startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, format, isSameDay } from 'date-fns';

// --- Constants & Helpers ---
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
interface ViewProps {
  navDate: Date,
  startDate: Date,
  endDate: Date,
  rangeType: RangeType,
  setRange: (range: { startDate: Date, endDate: Date, rangeType: RangeType }) => void,
  getMinutesForDate: (date: Date) => number,
  getMinutesForPeriod: (start: Date, end: Date) => number;
};
const getHeatmapColor = (minutes: number) => {
  if (minutes === 0) return 'bg-zinc-100 dark:bg-zinc-800';
  if (minutes < 60) return 'bg-emerald-200 dark:bg-emerald-900';
  if (minutes < 240) return 'bg-emerald-400 dark:bg-emerald-700';
  if (minutes < 360) return 'bg-emerald-500 dark:bg-emerald-600';
  return 'bg-emerald-700 dark:bg-emerald-500';
};

const getHeatmapTextColor = (minutes: number) => {
  if (minutes >= 120) return 'text-white';
  return 'text-foreground';
};

const formatTime = (minutes: number) => {
  if (minutes === 0) return '0min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
};

const getWeeksOfYear = (year: number) => {
  const weeks: { start: Date; end: Date; weekNumber: number }[] = [];
  const firstDay = new Date(year, 0, 1);
  const lastDay = new Date(year, 11, 31);

  const current = new Date(firstDay);
  const dayOfWeek = current.getDay();
  // Ajusta para a primeira segunda-feira (1)
  if (dayOfWeek !== 1) {
    current.setDate(current.getDate() + ((1 - dayOfWeek + 7) % 7));
  }

  let weekNumber = 1;
  while (current <= lastDay) {
    const weekStart = new Date(current);
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6);

    weeks.push({
      start: weekStart,
      end: weekEnd > lastDay ? lastDay : weekEnd,
      weekNumber,
    });

    current.setDate(current.getDate() + 7);
    weekNumber++;
  }
  return weeks;
};

const isPeriodInRange = (start: Date, end: Date, rangeStart: Date, rangeEnd: Date) => {
  return isSameDay(start, rangeStart) && isSameDay(end, rangeEnd);
};

// --- View Types & Components ---

interface ViewProps {
  navDate: Date;
  startDate: Date;
  endDate: Date;
  rangeType: RangeType;
  setRange: (range: { startDate: Date; endDate: Date; rangeType: RangeType }) => void;
  getMinutesForDate: (date: Date) => number;
  getMinutesForPeriod: (start: Date, end: Date) => number;
}

const DayView = ({ navDate, startDate, rangeType, setRange, getMinutesForDate }: ViewProps) => {
  const firstDay = startOfMonth(navDate);
  const lastDay = endOfMonth(navDate);
  const startDayOfWeek = firstDay.getDay();
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });

  const calendarDays = [...Array(startDayOfWeek).fill(null), ...days];

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {WEEKDAYS.map(day => (
        <div key={day} className="text-center text-[10px] font-medium text-muted-foreground pb-1">{day}</div>
      ))}
      {calendarDays.map((date, i) => {
        if (!date) return <div key={`empty-${i}`} className="aspect-square" />;
        const minutes = getMinutesForDate(date);
        const isSelected = isSameDay(date, startDate) && rangeType === 'day';

        return (
          <button
            key={date.toString()}
            onClick={() => setRange({ startDate: date, endDate: date, rangeType: 'day' })}
            className={`
                aspect-square rounded-md transition-all text-[11px] font-medium flex items-center justify-center
                ${getHeatmapColor(minutes)} ${getHeatmapTextColor(minutes)}
                ${isSelected ? 'ring-2 ring-primary ring-offset-1' : ''}
                hover:scale-110 cursor-pointer
              `}
            title={`${format(date, 'dd/MM')} — ${formatTime(minutes)}`}
          >
            {date.getDate()}
          </button>
        );
      })}
    </div>
  );
};

const WeekView = ({ navDate, startDate, endDate, rangeType, setRange, getMinutesForPeriod }: ViewProps) => {
  const weeks = getWeeksOfYear(navDate.getFullYear());
  const targetRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [navDate]);

  return (
    <div className="grid grid-cols-5 gap-1.5 max-h-[325px] overflow-y-auto px-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full pr-1.5">
      {weeks.map((week) => {
        const minutes = getMinutesForPeriod(week.start, week.end);
        const isInRange = rangeType === 'week' && isPeriodInRange(week.start, week.end, startDate, endDate);
        const weekLabel = `${week.start.getDate()}/${week.start.getMonth() + 1}~`;

        return (
          <button
            key={week.weekNumber}
            ref={isInRange ? targetRef : null}
            onClick={() => setRange({ startDate: week.start, endDate: week.end, rangeType: 'week' })}
            className={`
                aspect-square rounded-md transition-all text-[10px] font-medium
                flex flex-col items-center justify-center relative
                ${getHeatmapColor(minutes)} ${getHeatmapTextColor(minutes)}
                ${isInRange ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
                hover:scale-105 cursor-pointer
              `}
            title={weekLabel + ` — ${formatTime(minutes)}`}
          >
            <p>{weekLabel}</p>
            {minutes > 0 && (
              <p className="text-[8px] opacity-80">{formatTime(minutes)}</p>
            )}
          </button>
        );
      })}
    </div>
  );
};

const MonthView = ({ navDate, startDate, rangeType, setRange, getMinutesForPeriod }: ViewProps) => {
  const months = Array.from({ length: 12 }, (_, i) => new Date(navDate.getFullYear(), i, 1));

  return (
    <div className="grid grid-cols-4 gap-2">
      {months.map((month) => {
        const start = startOfMonth(month);
        const end = endOfMonth(month);
        const minutes = getMinutesForPeriod(start, end);
        const isSelected = isSameDay(start, startDate) && rangeType === 'month';

        return (
          <button
            key={month.toString()}
            onClick={() => setRange({ startDate: start, endDate: end, rangeType: 'month' })}
            className={`
                aspect-square rounded-md transition-all text-xs font-medium flex flex-col items-center justify-center p-2
                ${getHeatmapColor(minutes)} ${getHeatmapTextColor(minutes)}
                ${isSelected ? 'ring-2 ring-primary ring-offset-1' : ''}
                hover:scale-105 cursor-pointer
              `}
          >
            <span className="capitalize">{format(month, 'MMM')}</span>
            <span className="text-[10px] mt-1 opacity-80">{formatTime(minutes)}</span>
          </button>
        );
      })}
    </div>
  );
};

// --- Main Component ---
export function StudyHeatmap() {
  const { startDate, endDate, setRange, rangeType } = useSearchRangeStore();
  const [navDate, setNavDate] = useState(() => new Date(startDate));

  const searchInterval = useMemo(() => {
    if (rangeType === 'month' || rangeType === 'week') {
      return { start: startOfYear(navDate), end: endOfYear(navDate) };
    }
    return { start: startOfMonth(navDate), end: endOfMonth(navDate) };
  }, [navDate, rangeType]);

  const { data: analysis, isLoading } = useActivityAnalysis(searchInterval.start, searchInterval.end);

  // HeatMap vem diretamente do UserDailyStats (já agregado no servidor)
  // Antes: iterava sobre analysis?.logs calculando minutos manualmente no client
  const minutesByDate = useMemo(() => {
    return analysis?.charts?.heatMap ?? {};
  }, [analysis]);

  const getMinutesForDate = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd');
    return minutesByDate[key] || 0;
  };

  const getMinutesForPeriod = (start: Date, end: Date) => {
    return eachDayOfInterval({ start, end }).reduce((acc, date) => acc + getMinutesForDate(date), 0);
  };

  const changePeriod = (direction: number) => {
    setNavDate(prev => {
      const next = new Date(prev);
      if (rangeType === 'month' || rangeType === 'week') {
        next.setFullYear(next.getFullYear() + direction);
      } else {
        next.setMonth(next.getMonth() + direction);
      }
      return next;
    });
  };

  const navLabel = rangeType === 'month' || rangeType === 'week'
    ? navDate.getFullYear().toString()
    : format(navDate, 'MMMM yyyy');

  const viewProps: ViewProps = {
    navDate,
    startDate,
    endDate,
    rangeType: rangeType as RangeType,
    setRange: setRange as any,
    getMinutesForDate,
    getMinutesForPeriod,
  };


  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-violet-500" />
          Calendário de Atividades
        </CardTitle>
        <CardDescription>
          {isLoading ? 'Carregando dados...' : 'Visualize seu progresso no tempo'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changePeriod(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-sm capitalize">{navLabel}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changePeriod(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {rangeType === 'month' && <MonthView {...viewProps} />}
              {rangeType === 'week' && <WeekView {...viewProps} />}
              {rangeType === 'day' && <DayView {...viewProps} />}
              {rangeType === 'custom' && <DayView {...viewProps} />}
            </>
          )}

          <div className="flex items-center justify-center gap-3 pt-2 border-t">
            <span className="text-[10px] text-muted-foreground">Menos</span>
            <div className="flex gap-1">
              {[0, 60, 120, 180, 240].map((mins, i) => (
                <div key={i} className={`w-3.5 h-3.5 rounded-sm ${getHeatmapColor(mins)}`} />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">Mais</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
