"use client";
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type goalType = "minutes" | "hours";

interface goalsStorage {
    time: number,
    type: goalType,
}
function GoalSettings(
    { dailyGoalMinutes, setDailyGoalMinutes, isDialogOpen, setIsDialogOpen }:
        { dailyGoalMinutes: number; setDailyGoalMinutes: (value: number) => void; isDialogOpen: boolean; setIsDialogOpen: (value: boolean) => void; }
) {

    const [newGoal, setNewGoal] = useState(dailyGoalMinutes);

    const [type, setType] = useState<goalType>("minutes");

    const handleSaveGoal = () => {
        setDailyGoalMinutes(newGoal);
        localStorage.setItem("goals", JSON.stringify({
            time: newGoal,
            type,
        }));
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
                <div className="mt-2">
                    <div className="grid grid-cols-4 items-center gap-2">
                        <RadioGroup
                            defaultValue={type}
                            onValueChange={(value) => {
                                setType(value as goalType);
                                setNewGoal(value === "minutes" ? dailyGoalMinutes : dailyGoalMinutes * 60);
                            }}
                            className="col-span-2 flex items-center justify-center flex-col"
                        >
                            {Array.from<goalType>(["minutes", "hours"]).map(item => (
                                <div className="flex justify-center gap-2" key={item}>
                                    <RadioGroupItem value={item} id={item} />
                                    <Label htmlFor={item} >
                                        {item}
                                    </Label>
                                </div>
                            ))}

                        </RadioGroup>
                        <Input
                            type="number"
                            min={1}
                            value={type === "minutes" ? newGoal : newGoal / 60}
                            onChange={(e) => setNewGoal(type === "minutes" ? Number(e.target.value) : Number(e.target.value) * 60)}
                            className="col-span-2 rounded-lg flex items-center justify-center file:text-lg h-full text-center"
                        />

                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSaveGoal}>Salvar</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
};


function goalsLoad(): goalsStorage {
    if (typeof window !== "undefined") {
        const goals = localStorage.getItem("goals");
        if (goals) {
            return JSON.parse(goals) as goalsStorage;
        }
    }
    return {
        time: 300,
        type: "minutes" as goalType,
    };
}
export function DailyProgress({
    totalMinutes,
}: {
    totalMinutes: number;
}) {

    const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number>(() => goalsLoad().time);

    const [type, setType] = useState<goalType>(() => goalsLoad().type);

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const progress = Math.min((totalMinutes / dailyGoalMinutes) * 100, 100);
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    const minutosRestante = Math.max(0, dailyGoalMinutes - totalMinutes);
    const horasRestante = Math.floor(minutosRestante / 60);
    const minutosRestanteFinal = minutosRestante % 60;


    return (
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
                            {progress >= 100 ? "Meta batida! Parabéns! 🎉" : `Faltam ${horasRestante}h ${minutosRestanteFinal}m para a meta`}
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
    )
}