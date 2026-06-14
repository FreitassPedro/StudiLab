"use client";

import { HistoryDateNav } from "./components/HistoryDateNav";
import { TimelineLogs } from "./components/TimelineLogs";
import { LogsHistory } from "./components/LogsHistory";
import { SummaryCards } from "./components/SummaryCards";
import { HistoryCharts } from "./components/HistoryCharts";
import { StudyHeatmap } from "./components/charts/StudyHeatmap";
import { Suspense } from "react";


export function HistoryContent() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      <HistoryDateNav />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-5">
        {/* <ProductivityByPeriod logs={logs} /> */}
        <div className="col-span-1 sm:col-span-2">
          <StudyHeatmap />
        </div>
        <div className="col-span-1 sm:col-span-3">
          <SummaryCards />
        </div>
      </div>
      <HistoryCharts />
      <TimelineLogs />
      <Suspense fallback={<div>Loading logs...</div>}>
      <LogsHistory />
      </Suspense>
    </div>
  )
}
