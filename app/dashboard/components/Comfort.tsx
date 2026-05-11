"use client";

import { useTodayStudyLogs } from "@/hooks/useStudyLogs";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";

function getComfortLevel(totalMinutes: number) {
    if (totalMinutes < 60) {
        return {
            gif: "/images/sleepUnc.gif",
            message: "Parece que o Reizinho não tem sessões registradas para hoje. Que tal começar uma nova sessão e registrar seus estudos?"
        }
    } else if (totalMinutes < 400) {
        return {
            gif: "/images/studyUnc.gif",
            message: "O Reizinho teve um início de dia tranquilo, mas ainda tem muito potencial para continuar!"
        }
    } else {
        return {
            gif: "/images/tiredUnc.gif",
            message: "Uau, o Reizinho já acumulou um tempo de estudo impressionante hoje! Parece que a motivação está em alta. Descanse um pouco."
        }
    }
}

export function ComfortSection() {
    const { data: logs, isLoading } = useTodayStudyLogs();
    const user = useAuthStore((state) => state.user);

    if (isLoading) return null; // Ou um skeleton específico para conforto, se desejar


    if (user?.name !== "Laura") return null; // Se não for a Laura, não mostramos a seção de conforto
    const totalMinutes = logs?.reduce((sum, log) => sum + log.duration_minutes, 0) || 0;
    const level = getComfortLevel(totalMinutes);
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
    )
}