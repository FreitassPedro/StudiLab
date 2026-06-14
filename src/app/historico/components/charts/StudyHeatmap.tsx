"use client";
import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getHeatmapMonthDataAction, getHeatmapYearDataAction } from '@/server/actions/charts.action';

import useSearchRangeStore from '@/store/useSearchRangeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { parseDateAsLocal } from '@/lib/utils';


const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days: (Date | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
  return days;
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



// Retorna os 12 meses do ano atual
const getMonthsOfYear = (year: number) => {
  return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
};

// Retorna as semanas do ano atual (aproximadamente 52 semanas)
const getWeeksOfYear = (year: number) => {
  const weeks: { start: Date; end: Date; weekNumber: number }[] = [];

  const firstDay = new Date(year, 0, 1);
  const lastDay = new Date(year, 11, 31);

  // Encontra a primeira segunda-feira do ano (ou o primeiro dia se for segunda)
  let current = new Date(firstDay);
  const dayOfWeek = current.getDay();
  // Ajusta para a segunda-feira (1) da primeira semana
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

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function StudyHeatmap() {
  const { startDate, endDate, setRange, rangeType } = useSearchRangeStore();
  const range = { startDate, endDate };


  const userId = useAuthStore((state) => state.user?.id);
  const [currentMonth, setCurrentMonth] = useState(() => new Date(startDate));
  const [currentYear, setCurrentYear] = useState(() => startDate.getFullYear());

  // Query para dados do mês (visualização de dia)
  const { data: heatmapMonthData, isLoading: isLoadingMonth } = useQuery({
    queryKey: ['charts', 'heatmap', 'month', currentMonth.getFullYear(), currentMonth.getMonth(), userId],
    queryFn: () => getHeatmapMonthDataAction(currentMonth, userId!),
    enabled: !!userId && (!rangeType || rangeType === 'day'),
    staleTime: 1000 * 60 * 5,
  });

  // Query para dados do ano (visualização de semana e mês)
  const { data: heatmapYearData, isLoading: isLoadingYear } = useQuery({
    queryKey: ['charts', 'heatmap', 'year', currentYear, userId],
    queryFn: () => getHeatmapYearDataAction(currentYear, userId!),
    enabled: !!userId && (rangeType === 'week' || rangeType === 'month'),
    staleTime: 1000 * 60 * 5,
  });

  // Usa os dados corretos dependendo do rangeType
  const heatmapData = (rangeType === 'week' || rangeType === 'month') ? heatmapYearData : heatmapMonthData;
  const isLoading = (rangeType === 'week' || rangeType === 'month') ? isLoadingYear : isLoadingMonth;

  const minutesByDate = heatmapData?.minutesByDate ?? {};

  const getMinutesForDate = (date: Date | null) => {
    if (!date) return 0;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return minutesByDate[key] || 0;
  };

  // Calcula minutos totais em um período de datas
  const getMinutesForPeriod = (start: Date, end: Date) => {
    let total = 0;
    const current = new Date(start);
    while (current <= end) {
      total += getMinutesForDate(current);
      current.setDate(current.getDate() + 1);
    }
    return total;
  };

  const days = getDaysInMonth(currentMonth);

  const changeMonth = (direction: number) => {
    setCurrentMonth(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + direction);
      // Atualiza o ano também se necessário
      setCurrentYear(next.getFullYear());
      return next;
    });
  };

  const changeYear = (direction: number) => {
    const newYear = currentYear + direction;
    setCurrentYear(newYear);
    // Atualiza o mês para manter sincronizado
    setCurrentMonth(new Date(newYear, currentMonth.getMonth(), 1));
  };

  const isInRange = (date: Date | null) => {
    if (!date) return false;
    const d = date.getTime();
    const start = new Date(range.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(range.endDate);
    end.setHours(23, 59, 59, 999);
    return d >= start.getTime() && d <= end.getTime();
  };

  const isPeriodInRange = (start: Date, end: Date) => {
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    const e = new Date(end);
    e.setHours(23, 59, 59, 999);
    const rangeStart = new Date(range.startDate);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(range.endDate);
    rangeEnd.setHours(23, 59, 59, 999);

    return s.getTime() === rangeStart.getTime() && e.getTime() === rangeEnd.getTime();
  };

  const monthTotal = heatmapData?.monthTotalMinutes ?? 0;

  // Renderiza visualização de dia (calendário mensal)
  const renderDayView = () => (
    <>
      {/* Month navigator */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeMonth(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-semibold text-sm capitalize">
          {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeMonth(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-[10px] font-medium text-muted-foreground pb-1">
            {day}
          </div>
        ))}

        {/* Day cells */}
        {days.map((date, index) => {
          const minutes = getMinutesForDate(date);
          const inRange = isInRange(date);

          return (
            <button
              key={index}
              onClick={() => date && setRange({ startDate: date, endDate: date, rangeType: 'day' })}
              disabled={!date}
              className={`
                aspect-square rounded-md transition-all text-[11px] font-medium
                flex items-center justify-center relative
                ${date ? getHeatmapColor(minutes) : 'bg-transparent'}
                ${date ? getHeatmapTextColor(minutes) : ''}
                ${inRange ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
                ${date ? 'hover:scale-110 cursor-pointer' : ''}
              `}
              title={date ? `${date.getDate()}/${date.getMonth() + 1} — ${formatTime(minutes)}` : ''}
            >
              {date?.getDate()}
            </button>
          );
        })}
      </div>
    </>
  );

  // Renderiza visualização de semana
  const renderWeekView = () => {
    const weeks = getWeeksOfYear(currentYear);

    return (
      <>
        {/* Year navigator */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeYear(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-sm">
            Semanas de {currentYear}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeYear(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Week grid */}
        <div className="grid grid-cols-5 gap-1.5 max-h-105 overflow-y-auto px-2 rounded-2xl">
          {weeks.map((week) => {
            const minutes = getMinutesForPeriod(week.start, week.end);
            const inRange = isPeriodInRange(week.start, week.end);

            const startDay = parseDateAsLocal(week.start).getDate();
            const startMonth = parseDateAsLocal(week.start).getMonth() + 1;

            const weekLabel = `${startDay}/${startMonth}~`;
            return (
              <button
                key={week.weekNumber}
                onClick={() => setRange({ startDate: week.start, endDate: week.end, rangeType: 'week' })}
                className={`
                  aspect-square rounded-md transition-all text-[10px] font-medium
                  flex flex-col items-center justify-center relative
                  ${getHeatmapColor(minutes)}
                  ${getHeatmapTextColor(minutes)}
                  ${inRange ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
                  hover:scale-105 cursor-pointer
                `}
                title={weekLabel + ` — ${formatTime(minutes)}`}
              >
                <p>{weekLabel}</p>
                {minutes > 0 && (
                  <p className="text-[8px] text-gray-200">{formatTime(minutes)}</p>
                )}
              </button>
            );
          })}
        </div>
      </>
    );
  };

  // Renderiza visualização de mês
  const renderMonthView = () => {
    const months = getMonthsOfYear(currentYear);

    return (
      <>
        {/* Year navigator */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeYear(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-sm">
            Meses de {currentYear}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => changeYear(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-4 gap-2">
          {months.map((month, index) => {
            const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
            const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
            const minutes = getMinutesForPeriod(monthStart, monthEnd);
            const inRange = isPeriodInRange(monthStart, monthEnd);
            const monthName = month.toLocaleDateString('pt-BR', { month: 'short' });

            return (
              <button
                key={index}
                onClick={() => setRange({ startDate: monthStart, endDate: monthEnd, rangeType: 'month' })}
                className={`
                  aspect-square rounded-md transition-all text-xs font-medium
                  flex flex-col items-center justify-center relative p-2
                  ${getHeatmapColor(minutes)}
                  ${getHeatmapTextColor(minutes)}
                  ${inRange ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
                  hover:scale-105 cursor-pointer
                `}
                title={`${month.toLocaleDateString('pt-BR', { month: 'long' })} — ${formatTime(minutes)}`}
              >
                <span className="capitalize">{monthName}</span>
                <span className="text-[10px] mt-1">{formatTime(minutes)}</span>
              </button>
            );
          })}
        </div>
      </>
    );
  };

  // Determina qual visualização renderizar
  const renderContent = () => {
    switch (rangeType) {
      case 'week':
        return renderWeekView();
      case 'month':
        return renderMonthView();
      case 'day':
      default:
        return renderDayView();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-violet-500" />
          Calendário de Atividades
        </CardTitle>
        <CardDescription>
          {isLoading
            ? 'Carregando...'
            : monthTotal > 0 && rangeType === 'day'
              ? `${formatTime(monthTotal)} estudados em ${currentMonth.toLocaleDateString('pt-BR', { month: 'long' })}`
              : rangeType === 'week'
                ? 'Clique em uma semana para ver detalhes'
                : rangeType === 'month'
                  ? 'Clique em um mês para ver detalhes'
                  : 'Clique em um dia para ver detalhes'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {renderContent()}

          {/* Legend */}
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
