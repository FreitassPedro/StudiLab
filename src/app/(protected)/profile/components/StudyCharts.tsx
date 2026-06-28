"use client";

import { useProfileTheme } from "./ThemeContext";
import { ChartDataPoint } from "../types";
import { SectionLabel } from "./SectionLabel";
import { useState } from "react";
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

interface StudyChartsProps {
  data: ChartDataPoint[];
}

type ChartTab = "bar" | "line";

export function StudyCharts({ data }: StudyChartsProps) {
  const { accent } = useProfileTheme();
  const [tab, setTab] = useState<ChartTab>("bar");

  if (!data || data.length === 0) return null;

  const totalMins = data.reduce((s, d) => s + d.minutes, 0);
  const avgMins = Math.round(totalMins / data.length);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const mins = payload[0].value;
      const ph = Math.floor(mins / 60);
      const pm = mins % 60;
      const formatted = ph > 0 ? `${ph}h ${pm}m` : `${pm}m`;
      return (
        <div className="bg-card border border-border p-3 rounded-xl shadow-xl">
          <p className="text-foreground/50 text-xs mb-1">{label}</p>
          <p className="text-base font-bold" style={{ color: accent.accent }}>
            {formatted}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <SectionLabel>Evolução — 7 dias</SectionLabel>
        <div className="flex gap-1 bg-foreground/5 p-1 rounded-lg mb-4">
          {(["bar", "line"] as ChartTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-3 py-1 text-[11px] font-semibold rounded-md transition-all"
              style={
                tab === t
                  ? { background: `${accent.accent}25`, color: accent.accent }
                  : { color: "var(--muted-foreground)" }
              }
            >
              {t === "bar" ? "Barras" : "Linha"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary row */}
      <div className="flex items-center gap-6 px-1 mb-1">
        <div>
          <p className="text-[11px] text-foreground/35 uppercase tracking-wider font-semibold">Total</p>
          <p className="text-xl font-bold" style={{ color: accent.accent }}>
            {h}h {m}m
          </p>
        </div>
        <div className="w-px h-8 bg-foreground/10" />
        <div>
          <p className="text-[11px] text-foreground/35 uppercase tracking-wider font-semibold">Média/dia</p>
          <p className="text-xl font-bold text-foreground/70">
            {Math.floor(avgMins / 60)}h {avgMins % 60}m
          </p>
        </div>
      </div>

      <div className="p-5 rounded-2xl border border-border bg-foreground/[0.02]">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {tab === "bar" ? (
              <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}m`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="minutes" fill={accent.accent} radius={[5, 5, 0, 0]} barSize={24} />
              </BarChart>
            ) : (
              <LineChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}m`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke={accent.accent2}
                  strokeWidth={2.5}
                  dot={{ fill: "var(--background)", stroke: accent.accent2, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: accent.accent, stroke: "var(--background)", strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
