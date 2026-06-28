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

const CHART_DATA = [
  { name: "Seg", minutes: 120 },
  { name: "Ter", minutes: 180 },
  { name: "Qua", minutes: 150 },
  { name: "Qui", minutes: 210 },
  { name: "Sex", minutes: 90 },
  { name: "Sáb", minutes: 240 },
  { name: "Dom", minutes: 150 },
];

const ACCENT = "#8b5cf6";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const mins = payload[0].value;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const label2 = h > 0 ? `${h}h ${m}m` : `${m}m`;
    return (
      <div className="bg-[#1a1a24] border border-white/10 p-3 rounded-xl shadow-xl text-white">
        <p className="text-white/50 text-xs mb-1">{label}</p>
        <p className="text-base font-bold" style={{ color: ACCENT }}>
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
  const totalMins = CHART_DATA.reduce((s, d) => s + d.minutes, 0);
  const totalH = Math.floor(totalMins / 60);
  const totalM = totalMins % 60;

  return (
    <div className="rounded-2xl border border-border/40 bg-card/40 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Semana Atual
          </p>
          <p className="text-2xl font-bold text-foreground mt-0.5">
            {totalH}h {totalM}m estudados
          </p>
        </div>
        <div className="flex gap-1 bg-muted/40 p-1 rounded-lg">
          {(["bar", "line"] as ChartTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 text-xs rounded-md font-semibold transition-all ${
                tab === t
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
            <BarChart data={CHART_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}m`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="minutes" fill={ACCENT} radius={[5, 5, 0, 0]} barSize={26} opacity={0.85} />
            </BarChart>
          ) : (
            <LineChart data={CHART_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
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
                dot={{ fill: "#0a0a0f", stroke: ACCENT, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: ACCENT, stroke: "#0a0a0f", strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
