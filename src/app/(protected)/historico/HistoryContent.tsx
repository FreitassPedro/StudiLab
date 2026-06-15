"use client";

import { HistoryDateNav } from "./components/HistoryDateNav";
import { TimelineLogs } from "./components/TimelineLogs";
import { LogsHistory } from "./components/LogsHistory";
import { SummaryCards } from "./components/SummaryCards";
import { HistoryCharts } from "./components/HistoryCharts";
import { StudyHeatmap } from "./components/charts/StudyHeatmap";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, List, History as HistoryIcon, LayoutGrid, Calendar } from "lucide-react";

export function HistoryContent() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">

            {/* Navegação de Data e Resumo Rápido */}
            <section className="space-y-6">
                <HistoryDateNav />

                <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                        <StudyHeatmap />
                    </div>
                    <div className="lg:col-span-8">
                        <SummaryCards />
                    </div>
                </div>
            </section>

            {/* Interface de Abas Interativas */}
            <Tabs defaultValue="analysis" className="w-full justify-center space-y-6">
                <div className="flex items-center  justify-center">
                    <TabsList className="bg-muted/50 p-1 rounded-xl">
                        <TabsTrigger value="analysis" className="rounded-lg gap-2 px-6">
                            <BarChart3 className="w-4 h-4" />
                            <span className="hidden sm:inline">Análise Visual</span>
                        </TabsTrigger>
                        <TabsTrigger value="timeline" className="rounded-lg gap-2 px-6">
                            <Calendar className="w-4 h-4" />
                            <span className="hidden sm:inline">Linha do Tempo</span>
                        </TabsTrigger>
                        <TabsTrigger value="logs" className="rounded-lg gap-2 px-6">
                            <List className="w-4 h-4" />
                            <span className="hidden sm:inline">Lista de Logs</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="analysis" className="space-y-6 animate-in slide-in-from-left-4 duration-500">
                    <HistoryCharts />
                </TabsContent>

                <TabsContent value="timeline" className="animate-in slide-in-from-left-4 duration-500">
                    <div className="bg-card border rounded-2xl p-6 shadow-sm">
                        <TimelineLogs />
                    </div>
                </TabsContent>

                <TabsContent value="logs" className="animate-in slide-in-from-left-4 duration-500">
                    <Suspense fallback={
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
                            ))}
                        </div>
                    }>
                        <LogsHistory />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    )
}
