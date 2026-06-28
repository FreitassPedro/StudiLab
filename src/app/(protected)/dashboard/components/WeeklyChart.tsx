"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import { useDashboardData } from "@/hooks/useDashboard";
import { useHistoryAnalysis } from "@/hooks/useActivity";
import { endOfWeek, startOfWeek, eachDayOfInterval, format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ACCENT = "var(--foreground)";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const mins = payload[0].value;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const label2 = h > 0 ? `${h}h ${m}m` : `${m}m`;
    return (
      <div className="bg-card border border-border/40 p-3 rounded-xl shadow-xl">
        <p className="text-muted-foreground text-xs mb-1">{label}</p>
        <p className="text-base text-foreground" >
          {label2}
        </p>
      </div>
    );
  }
  return null;
};

type ChartTab = "bar" | "line";

export function DashboardWeeklyChart() {
  const [tab, setTab] = useState<ChartTab>("bar");

  const today = new Date();
  const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
  const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });
  const { data, isLoading } = useHistoryAnalysis(startOfThisWeek, endOfThisWeek);

  if (isLoading || !data?.charts?.areaChart) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card/40 p-5 space-y-4 h-[300px] animate-pulse">
        <div className="h-8 w-1/3 bg-muted rounded"></div>
        <div className="h-48 w-full bg-muted/50 rounded mt-4"></div>
      </div>
    );
  }

  const days = eachDayOfInterval({ start: startOfThisWeek, end: endOfThisWeek });
  const chartData = days.map((day) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const dayData = data.charts.areaChart[dateKey];
    
    // Formata o dia da semana ("seg", "ter") e capitaliza a primeira letra
    let name = format(day, "EE", { locale: ptBR });
    name = name.charAt(0).toUpperCase() + name.slice(1);
    
    return {
      name,
      minutes: dayData ? dayData.totalMinutes : 0
    };
  });

  const totalMins = chartData.reduce((s, d) => s + d.minutes, 0);
  const totalH = Math.floor(totalMins / 60);
  const totalM = totalMins % 60;


  return (
    <div className="rounded-2xl border border-border/40 bg-card/40 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Semana Atual
          </p>
          <p className="text-2xl font-semibold text-foreground mt-0.5">
            {totalH}h {totalM}m
          </p>
        </div>
        <div className="flex gap-1 bg-muted/40 p-1 rounded-lg">
          {(["bar", "line"] as ChartTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 text-xs rounded-md font-semibold transition-all ${tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {t === "bar" ? "Barras" : "Linha"}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {tab === "bar" ? (
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}m`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="minutes" fill={"var(--foreground)"} radius={[5, 5, 0, 0]} barSize={26} opacity={0.85} />
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}m`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="minutes"
                stroke={ACCENT}
                strokeWidth={2.5}
                dot={{ fill: "var(--muted-foreground)", stroke: ACCENT, strokeWidth: 0.5, r: 4 }}
                activeDot={{ r: 6, fill: ACCENT, stroke: "var(--muted-foreground)", strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
