"use client";

import Link from "next/link";
import { useSubjects } from "@/hooks/useSubjects";
import { cn } from "@/lib/utils";

import { useParams } from "next/navigation";

export function SubjectSidebar() {
  const params = useParams();
  const currentSubjectId = params.subjectId as string | undefined;
  const { data: subjects, isLoading } = useSubjects();

  if (isLoading) {
    return (
      <div className="w-64 h-full border-r bg-card/50 p-4 space-y-2">
        <div className="h-8 bg-muted animate-pulse rounded-md w-3/4 mb-4" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!subjects) return null;

  return (
    <aside className="w-64 h-full border-r bg-card/30 flex flex-col  md:flex">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
          Matérias
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {subjects.map((subject) => {
          const isActive = subject.id === currentSubjectId;
          return (
            <Link
              key={subject.id}
              href={`/materias/${subject.id}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-primary/10 font-semibold" 
                  : "hover:bg-muted/50 text-muted-foreground hover:text-foreground font-medium"
              )}
            >
              <div 
                className="w-2.5 h-2.5 rounded-full shrink-0" 
                style={{ backgroundColor: subject.color }} 
              />
              <span 
                className="truncate text-sm"
                style={isActive ? { color: subject.color } : {}}
              >
                {subject.name}
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
