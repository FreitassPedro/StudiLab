"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/useDashboard";
import { BookOpen, Target, Pencil } from "lucide-react";
import { TodaySummarySkeleton } from "./Skeletons";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";


function GoalSettings(
    { dailyGoalMinutes, setDailyGoalMinutes, isDialogOpen, setIsDialogOpen }:
        { dailyGoalMinutes: number; setDailyGoalMinutes: (value: number) => void; isDialogOpen: boolean; setIsDialogOpen: (value: boolean) => void; }
) {

    const [newGoal, setNewGoal] = useState(dailyGoalMinutes);

    const handleSaveGoal = () => {
        setDailyGoalMinutes(newGoal);
        localStorage.setItem("dailyGoalMinutes", newGoal.toString());
        setIsDialogOpen(false);
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-muted">
                    <Pencil className="h-3 w-3 text-muted-foreground" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Alterar Meta Diária</DialogTitle>
                </DialogHeader>
                <div className="">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="goal" className="col-span-1">
                            Minutos
                        </Label>
                        <Input
                            id="goal"
                            type="number"
                            value={newGoal}
                            onChange={(e) => setNewGoal(Number(e.target.value))}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSaveGoal}>Salvar</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
export function TodaySummary() {
    const { data: dashboardData, isLoading } = useDashboardData();
    const logs = dashboardData?.logs;
    const summary = dashboardData?.summary;

    const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number>(() => {
        if (typeof window !== "undefined") {
            return Number(localStorage.getItem("dailyGoalMinutes")) || 550;
        }
        return 300;
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    if (isLoading || !logs || !summary) {
        return <TodaySummarySkeleton />;
    }

    const totalMinutes = summary.totalMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const progress = Math.min((totalMinutes / dailyGoalMinutes) * 100, 100);
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    const lastSubject = summary.topSubject?.name || 'Nenhuma';

    return (
        <div className="grid gap-4 md:grid-cols-4">
            {/* Card de Progresso Principal */}
            <Card className="md:col-span-2 overflow-hidden border-none bg-linear-to-br from-card/50 via-background to-secondary/5 shadow-inner">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Progresso Diário</p>
                                <GoalSettings
                                    dailyGoalMinutes={dailyGoalMinutes}
                                    setDailyGoalMinutes={setDailyGoalMinutes}
                                    isDialogOpen={isDialogOpen}
                                    setIsDialogOpen={setIsDialogOpen}
                                />

                            </div>
                            <h3 className="text-3xl font-bold">
                                {hours}h {minutes}m
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {progress >= 100 ? "Meta batida! Parabéns! 🎉" : `Faltam ${Math.max(0, dailyGoalMinutes - totalMinutes)} min para a meta`}
                            </p>
                        </div>

                        {/* Radial Progress SVG */}
                        <div className="relative flex items-center justify-center">
                            <svg className="w-24 h-24 transform -rotate-90">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-muted/20"
                                />
                                <circle
                                    cx="48"
                                    cy="48"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    strokeLinecap="round"
                                    className="text-primary transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <span className="absolute text-sm font-bold">{Math.round(progress)}%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats Cards */}
            <Card className="hover:shadow-md transition-all border-border/40">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div className="p-2 w-fit bg-orange-500/10 rounded-lg">
                        <BookOpen className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{logs.length}</p>
                        <p className="text-sm text-muted-foreground font-medium">Sessões Concluídas</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all border-border/40">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div className="p-2 w-fit bg-blue-500/10 rounded-lg">
                        <Target className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xl font-bold truncate" title={lastSubject}>
                            {lastSubject}
                        </p>
                        <p className="text-sm text-muted-foreground font-medium">Última Matéria</p>
                    </div>
                </CardContent>
            </Card>


        </div>
    );
}