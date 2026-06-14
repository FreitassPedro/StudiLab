"use client";
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Search } from 'lucide-react';

import { type DateRange as CalendarDateRange } from "react-day-picker";

import { ptBR } from 'date-fns/locale';
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { addDays, addMonths, addWeeks, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, subDays, subMonths, subWeeks } from 'date-fns';
import useSearchRangeStore from '@/store/useSearchRangeStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getLocalDateForToday } from "@/lib/utils";

export type RangeType = 'day' | 'week' | 'month' | 'custom';

export function HistoryDateNav() {

    const { startDate, endDate, setRange, setRangeType, rangeType } = useSearchRangeStore();

    const [isOpenPicker, setIsOpenPicker] = useState(false);
    const [pickingRange, setPickingRange] = useState<CalendarDateRange>({ from: startDate, to: endDate });
    const [customOptions, setCustomOptions] = useState<'last7days' | 'last30days' | 'calendar' | ''>('');
    const todayRef = useRef<Date>(startDate);
    const calendarRef = useRef<HTMLDivElement>(null);

    // Definir rangeType para 'day' (hoje) quando o componente carregar
    useEffect(() => {
        const today = getLocalDateForToday();
        todayRef.current = today;
        setRange({ startDate: today, endDate: today });
        setRangeType('day');
    }, [setRange, setRangeType]);

    const handleRangeTypeChange = (type: string) => {
        const newType = type as RangeType;
        setRangeType(newType);

        if (newType !== 'custom') {
            setCustomOptions('');
        }

        const today = getLocalDateForToday();

        switch (type) {
            case 'day':
                setRange({ startDate: today, endDate: today });
                setRangeType('day');
                break;
            case 'week':
                const mondayStart = startOfWeek(today, { weekStartsOn: 1 });
                const endOfWeekDate = endOfWeek(today, { weekStartsOn: 1 });
                setRange({
                    startDate: mondayStart,
                    endDate: endOfWeekDate,
                });
                setRangeType('week');
                break;
            case 'month':
                setRange({
                    startDate: startOfMonth(today),
                    endDate: endOfMonth(today),
                });
                setRangeType('month');
                break;
            case 'last7days':
                setRange({
                    startDate: subDays(today, 6),
                    endDate: today,
                });
                setRangeType('custom');
                break;
            case 'last30days':
                setRange({
                    startDate: subDays(today, 29),
                    endDate: today,
                });
                setRangeType('custom');
                break;
            case 'calendar':
                setRangeType('custom');
                setIsOpenPicker(true);
                break;
            default:
                break;
        }
    };


    const navigate = (direction: -1 | 1) => {
        let newStart: Date;
        let newEnd: Date;

        switch (rangeType) {
            case 'day':
                newStart = direction === 1 ? addDays(startDate, 1) : subDays(startDate, 1);
                newEnd = newStart;
                break;
            case 'week':
                newStart = direction === 1 ? addWeeks(startDate, 1) : subWeeks(startDate, 1);
                const dayOfWeek = newStart.getDay();
                const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
                newEnd = new Date(newStart);
                newEnd.setDate(newStart.getDate() + daysToSunday);
                newEnd.setHours(0, 0, 0, 0);

                break;
            case 'month':
                newStart = direction === 1 ? addMonths(startDate, 1) : subMonths(startDate, 1);
                newEnd = endOfMonth(newStart);
                break;
            case 'custom':
                newStart = direction === 1 ? addDays(startDate, 1) : subDays(startDate, 1);
                newEnd = newStart;
                break;
            default:
                newStart = startDate;
                newEnd = endDate;
                break;
        }

        setRange({ startDate: newStart, endDate: newEnd });
    };

    const getDisplayLabel = () => {
        if (customOptions === 'last7days') {
            return `Últimos 7 dias`;
        }
        if (customOptions === 'last30days') {
            return `Últimos 30 dias`;
        }

        switch (rangeType) {
            case 'day':
                return format(startDate, "d 'de' MMMM, yyyy", { locale: ptBR });
            case 'week':
                return `${format(startDate, 'd MMM', { locale: ptBR })} – ${format(endDate, "d MMM, yyyy", { locale: ptBR })}`;
            case 'month':
                return format(startDate, "MMMM 'de' yyyy", { locale: ptBR });
            case 'custom':
                return `${format(startDate, 'd MMM', { locale: ptBR })} – ${format(endDate, 'd MMM yyyy', { locale: ptBR })}`;
            default:
                return `${format(startDate, 'd MMM yyyy', { locale: ptBR })} – ${format(endDate, 'd MMM yyyy', { locale: ptBR })}`;
        }
    };


    /*
    const onPickingCalendarChange = (selected: CalendarDateRange | undefined) => {
        // Clear calendar first
        console.log("Picking range changed:", selected);
        if (!selected) {
            setPickingRange(undefined);
            return;
        }

        // Pick first date
        if (!selected?.from && !selected.to) {
            setPickingRange({ from: selected.from, to: undefined });
            return;
        }

        // Pick second date
        if (selected?.from && !selected.to) {
            setPickingRange({ from: selected.from, to: selected.to });
            return;
        }

        // close Calendar and trigger onRangeChange
        if (pickingRange?.from && pickingRange?.to) {
            setRange({ startDate: pickingRange.from, endDate: pickingRange.to });
            setPickingRange(undefined);
            setIsOpenPicker(false);
        }
    };
    */

    const handleOpenCalendarPicker = () => {
        setCustomOptions('calendar');
        setIsOpenPicker(true);
    }

    const handleCloseCalendarPicker = () => {
        setCustomOptions('');
        setIsOpenPicker(false);
    }

    const handleCalendarSearch = () => {
        if (pickingRange?.from && pickingRange?.to) {
            setRange({ startDate: pickingRange.from, endDate: pickingRange.to });
            setIsOpenPicker(false);
        }
    };


    // Fechar calendar picker ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                handleCloseCalendarPicker();
            }
        };

        if (isOpenPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpenPicker]);


    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-card border rounded-lg">
            {/* Mobile: Select Dropdown */}
            <div className="w-full">
                <div className="flex sm:hidden w-full gap-2 relative items-center ">
                    <Select value={rangeType ?? customOptions} onValueChange={handleRangeTypeChange}>
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Dia</SelectItem>
                            <SelectItem value="week">Semana</SelectItem>
                            <SelectItem value="month">Mês</SelectItem>
                            <SelectItem value="last7days">Últimos 7 dias</SelectItem>
                            <SelectItem value="last30days">Últimos 30 dias</SelectItem>
                            <SelectItem value="calendar">Personalizado</SelectItem>
                        </SelectContent>
                    </Select>

                    {isOpenPicker && (
                        <div ref={calendarRef} className="absolute left-0 top-full z-50 mt-2">
                            <Card className="w-fit p-0">
                                <CardContent className="p-0">
                                    <Calendar
                                        mode="range"
                                        defaultMonth={startDate}
                                        selected={pickingRange}
                                        onSelect={setPickingRange}
                                        required
                                    />
                                </CardContent>
                                <Button variant="secondary" size="sm" className="m-2"
                                    onClick={() => handleCalendarSearch()}>
                                    Buscar
                                    <Search className="h-4 w-4" />
                                </Button>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Desktop: Tabs */}
                <Tabs value={rangeType} onValueChange={handleRangeTypeChange} className="hidden sm:block">
                    <TabsList>
                        <TabsTrigger className=' cursor-pointer items-center px-3' value="day">Dia</TabsTrigger>
                        <TabsTrigger className=' cursor-pointer items-center px-3' value="week">Semana</TabsTrigger>
                        <TabsTrigger className=' cursor-pointer items-center px-3' value="month">Mês</TabsTrigger>

                        <Select value={customOptions} onValueChange={handleRangeTypeChange}>
                            <SelectTrigger className="h-9 w-40 self-center">
                                <SelectValue placeholder="Mais opções..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='last7days'>Últimos 7 dias</SelectItem>
                                <SelectItem value='last30days'>Últimos 30 dias</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="relative flex items-center">
                            <TabsTrigger className='cursor-pointer bg-primary/80 text-secondary' value="custom" onClick={handleOpenCalendarPicker}>
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Personalizado
                            </TabsTrigger>

                            {isOpenPicker && (
                                <div ref={calendarRef} className="absolute left-0 top-full z-50 mt-2">
                                    <Card className="w-fit p-0">
                                        <CardContent className="p-0">
                                            <Calendar
                                                mode="range"
                                                defaultMonth={startDate}
                                                selected={pickingRange}
                                                onSelect={setPickingRange}
                                                required
                                            />
                                        </CardContent>
                                        <Button variant="secondary" size="sm" className="m-2"
                                            onClick={() => handleCalendarSearch()}>
                                            Buscar
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </TabsList>
                </Tabs>
            </div>

            {/* Navigate by Buttons */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="h-8 w-8 shrink-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium justify-center flex-1 sm:flex-initial min-w-0">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="capitalize truncate">{getDisplayLabel()}</span>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(1)}
                    className="h-8 w-8 shrink-0"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>

                
            </div>
        </div >
    );
}
