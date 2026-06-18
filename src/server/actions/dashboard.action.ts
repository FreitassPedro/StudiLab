"use server";

import { getTodayStudyLogsAction } from "./studyLogs.action";
import { getSubjectsAction } from "./subject.actions";
import { getTopicsAction } from "./topic.action";
import { Subject } from "@/types/types";

export type DashboardData = {
    todayLogs: any[];
    subjects: Subject[];
    topics: any[];
};

export async function getDashboardDataAction(todayDate: Date): Promise<DashboardData> {
    // Novamente, o React.cache em getCurrentUser garantirá apenas UMA query de sessão
    const [todayLogs, subjects, topics] = await Promise.all([
        getTodayStudyLogsAction(todayDate),
        getSubjectsAction(),
        getTopicsAction(),
    ]);

    return {
        todayLogs,
        subjects,
        topics,
    };
}
