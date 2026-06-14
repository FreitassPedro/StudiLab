"use client";

import { StudyAreaChart } from "./charts/StudyAreaChart";
import { StudyHeatmap } from "./charts/StudyHeatmap";
import { StudyPieChart } from "./charts/StudyPieChart";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChartIcon } from "lucide-react";
import { StudyBarChart } from "./charts/StudyBarChart";

const ChartSkeleton = () => {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4 text-cyan-500" />
                    Distribuição por Matéria
                </CardTitle>
                <CardDescription>Tempo dedicado a cada área</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center h-50 text-sm text-muted-foreground">
                    Carregando...
                </div>
            </CardContent>
        </Card>
    );
}
export const HistoryCharts = () => {


    return (
        <>
            
            <div className="grid gap-4 md:grid-cols-2">
                <Suspense fallback={<ChartSkeleton />}>
                    <StudyBarChart />
                </Suspense>

                <Suspense fallback={<ChartSkeleton />}>
                    <StudyPieChart />
                </Suspense>
                <Suspense fallback={<ChartSkeleton />}>
                    <StudyAreaChart />
                </Suspense>
            </div>

        </>
    );
}