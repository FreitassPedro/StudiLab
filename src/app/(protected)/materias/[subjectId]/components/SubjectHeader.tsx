"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubjects } from "@/hooks/useSubjects";
import { useTopics } from "@/hooks/useTopics";
import { useMemo } from "react";

interface Props {
    subjectId: string;
}

export function SubjectHeader({ subjectId }: Props) {
    const { data: subjects } = useSubjects();
    const { data: topicsData } = useTopics();

    const subject = useMemo(
        () => subjects?.find((s) => s.id === subjectId),
        [subjects, subjectId]
    );

    const topicCount = useMemo(
        () => topicsData?.topics?.filter((t) => t.subjectId === subjectId).length ?? 0,
        [topicsData, subjectId]
    );

    if (!subject) return null;

    return (
        <header className="flex items-center gap-4 border-b pb-6">
            <Link href="/materias">
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>

            <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Color / Icon orb */}
                <div
                    className="w-11 h-11 rounded-2xl shadow-sm flex items-center justify-center shrink-0"
                    style={{ backgroundColor: subject.color + "22", border: `2px solid ${subject.color}40` }}
                >
                    {subject.icon ? (
                        <span className="text-xl">{subject.icon}</span>
                    ) : (
                        <BookOpen size={20} style={{ color: subject.color }} />
                    )}
                </div>

                <div className="min-w-0">
                    <h1 className="text-2xl font-extrabold tracking-tight truncate" style={{ color: subject.color }}>
                        {subject.name}
                    </h1>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Hash size={10} />
                        {topicCount} tópico{topicCount !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {/* Accent bar */}
            <div
                className="hidden sm:block h-1 w-24 rounded-full opacity-60"
                style={{ backgroundColor: subject.color }}
            />
        </header>
    );
}
