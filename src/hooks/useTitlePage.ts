import { useEffect, useRef } from "react";

const BASE_TITLE = "Monitor de Estudos";

interface useTitlePageInput {
    title: string;
}

export function useTitlePage({ title }: useTitlePageInput) {
    const previousTitleRef = useRef<string>("");

    useEffect(() => {
        const newTitle = title ? `${title} - ${BASE_TITLE}` : BASE_TITLE;
        if (!previousTitleRef.current) {
            previousTitleRef.current = document.title;
        }

        if (title) {
            document.title = newTitle;
        }



        document.title = newTitle;
    }, [title]);


    useEffect(() => {
        return () => {
            document.title = previousTitleRef.current || BASE_TITLE;
        };
    }, []);

}