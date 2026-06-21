"use client";

import { useTodayActivity } from "@/hooks/useActivity";
import { useDashboardData } from "@/hooks/useDashboard";

import Image from "next/image";

function getComfortLevel(totalMinutes: number) {
    if (totalMinutes < 60) {
        return {
            gif: "/images/sleepUnc.gif",
            message: "Parece que o Reizinho não tem sessões registradas para hoje. Que tal começar uma nova sessão e registrar seus estudos?"
        }
    } else if (totalMinutes < 300) {
        return {
            gif: "/images/studyUnc.gif",
            message: "O Reizinho teve um início de dia tranquilo, mas ainda tem muito potencial para continuar!"
        }
    } else if (totalMinutes < 420) {
        return {
            gif: "/images/uncledoctor.jpg",
            message: "O Reizinho está indo muito bem hoje! Continue assim, mas lembre-se de fazer pausas para descansar."
        }
    }
    // Maior que 420minutos
    else {
        return {
            gif: "/images/tiredUnc.gif",
            message: "Uau, o Reizinho já acumulou um tempo de estudo impressionante hoje! Parece que a motivação está em alta. Descanse um pouco."
        }
    }
}





export function ComfortSection() {
    const { data: todayActivity, isLoading } = useTodayActivity();

    if (isLoading) return null;

    const minutes = todayActivity?.summary?.totalMinutes || 0;

    const level = getComfortLevel(minutes);
    return (
        <div className="bg-linear-to-r h-40 from-primary/10 to-secondary/10 rounded-lg p-4 flex items-center gap-6">
            <div className="relative shrink-0 ">
                <Image
                    src={level.gif}
                    alt="Imagem engraçada de sono"
                    className="rounded-lg relative object-cover"
                    width={120}
                    height={120}
                    unoptimized
                />
            </div>
            <div>
                <p className="text-muted-foreground">
                    {level.message}
                </p>
            </div>
        </div>
    );
}