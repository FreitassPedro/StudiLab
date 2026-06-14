import { useEffect, useRef } from "react";

const padTwo = (n: number) => n.toString().padStart(2, "0");

const formatCronometerTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${padTwo(hrs)}:${padTwo(mins)}:${padTwo(secs)}`;
};

interface UsePageTitleWithCronometerInput {
    isRunning: boolean;
    seconds: number;
    baseTitle: string;
}

export function usePageTitleWithCronometer({
    isRunning,
    seconds,
    baseTitle,
}: UsePageTitleWithCronometerInput) {
    const previousTitleRef = useRef<string>("");

    useEffect(() => {
        if (!previousTitleRef.current) {
            previousTitleRef.current = document.title;
        }

        if (isRunning) {
            document.title = `${formatCronometerTime(seconds)} - ${baseTitle}`;
            return;
        }

        document.title = baseTitle;
    }, [isRunning, seconds, baseTitle]);

    useEffect(() => {
        return () => {
            document.title = previousTitleRef.current || baseTitle;
        };
    }, [baseTitle]);
}
