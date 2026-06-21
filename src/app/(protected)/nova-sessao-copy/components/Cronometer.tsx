
import useCronometerStore from "@/store/useCronometerStore";
import { useCallback, useState } from "react";
import { CircularTimer } from "./CircularTimer";


const padTwo = (n: number) => n.toString().padStart(2, "0");

function TimeDislay({ seconds }: { seconds: number }) {
    const [isTimeHidden, setIsTimeHidden] = useState(false);


    const formatTime = useCallback(() => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${padTwo(hrs)}:${padTwo(mins)}:${padTwo(secs)}`;
    }, [seconds])

    const displayTime = isTimeHidden ? "--:--:--" : formatTime();

    return (
        <span className="text-4xl md:text-5xl font-mono font-bold tabular-nums">
            {displayTime}
        </span>
    )
};


export function Cronometer() {

    const isCronometerRunning = useCronometerStore((state) => state.cronometer.isRunning);

    const seconds = useCronometerStore((state) => state.cronometer.seconds);

    const progress = 1;


    console.log("Seconds: ", seconds)

    return (
        <CircularTimer
            progress={progress}
            isRunning={isCronometerRunning}
            color={"orange"}
        >
            <span className="text-xs text-muted-foreground font-mono uppercase tracking-tighter mb-1">
                {isCronometerRunning ? "Em Foco" : "Pausado"}
            </span>
            <TimeDislay seconds={seconds} />
        </CircularTimer>
    )
}