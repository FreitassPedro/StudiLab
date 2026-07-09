"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { CheckCircle2, Circle, Trash2, ListTodo, Plus, ChevronDown } from "lucide-react";
import { useSubjectTasks } from "@/hooks/useSubjectTasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ─── Task Item ────────────────────────────────────────────────────────────────

function TaskItem({
    id,
    text,
    completed,
    completedAt,
    onToggle,
    onDelete,
    onEdit,
}: {
    id: string;
    text: string;
    completed: boolean;
    completedAt: string | null;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string, text: string) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(text);

    const saveEdit = () => {
        if (val.trim()) onEdit(id, val);
        else setVal(text);
        setEditing(false);
    };

    return (
        <div
            className={cn(
                "group flex items-start gap-3 py-2.5 px-3 rounded-xl transition-all duration-150",
                "hover:bg-muted/40",
                completed && "opacity-60"
            )}
        >
            {/* Checkbox */}
            <button
                onClick={() => onToggle(id)}
                className="mt-0.5 shrink-0 transition-colors"
                title={completed ? "Marcar como pendente" : "Concluir"}
            >
                {completed ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                    <Circle size={18} className="text-muted-foreground/50 hover:text-primary transition-colors" />
                )}
            </button>

            {/* Text */}
            <div className="flex-1 min-w-0">
                {editing ? (
                    <Input
                        autoFocus
                        value={val}
                        onChange={(e) => setVal(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === "Enter") saveEdit();
                            if (e.key === "Escape") { setVal(text); setEditing(false); }
                        }}
                        className="h-7 text-sm py-0 px-1 bg-transparent border-0 border-b border-primary/40 rounded-none focus-visible:ring-0 shadow-none"
                    />
                ) : (
                    <p
                        onClick={() => !completed && setEditing(true)}
                        className={cn(
                            "text-sm leading-snug select-none",
                            completed ? "line-through text-muted-foreground" : "cursor-text"
                        )}
                    >
                        {text}
                    </p>
                )}
                {completed && completedAt && (
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                        Concluída em{" "}
                        {new Date(completedAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </p>
                )}
            </div>

            {/* Delete */}
            <button
                onClick={() => onDelete(id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0"
                title="Remover"
            >
                <Trash2 size={13} />
            </button>
        </div>
    );
}

function TaskAdd({ subjectId }: { subjectId: string }) {

    const { addTask } = useSubjectTasks(subjectId);
    const [newTaskText, setNewTaskText] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleAdd = () => {
        if (!newTaskText.trim()) return;
        addTask(newTaskText);
        setNewTaskText("");
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleAdd();
    };
    return (
        <div className="flex items-center gap-2 p-1 rounded-xl border border-dashed border-border hover:border-primary/40 focus-within:border-primary/40 transition-colors bg-card/50">
            <div className="pl-2">
                <Plus size={16} className="text-muted-foreground" />
            </div>
            <Input
                ref={inputRef}
                placeholder="Adicionar tarefa..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm h-9 "
            />
            {newTaskText.trim() && (
                <Button size="sm" className="h-7 rounded-lg shrink-0 mr-1" onClick={handleAdd}>
                    Adicionar
                </Button>
            )}
        </div>
    );
}
// ─── Main Export ──────────────────────────────────────────────────────────────

export function TasksSection({ subjectId }: { subjectId: string }) {
    const { pending, completed, toggleTask, deleteTask, editTask, clearCompleted } =
        useSubjectTasks(subjectId);

    const [showCompleted, setShowCompleted] = useState(false);

    const totalTasks = pending.length + completed.length;

    return (
        <div className="space-y-4">
            <TaskAdd subjectId={subjectId} />

            {/* Empty state */}
            {totalTasks === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center">
                        <ListTodo size={22} className="text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">Nenhuma tarefa ainda.</p>
                    <p className="text-xs text-muted-foreground/60">
                        Adicione tarefas para acompanhar o que precisa estudar!
                    </p>
                </div>
            )}

            {/* Pending tasks */}
            {pending.length > 0 && (
                <div className="space-y-0.5">
                    {pending.map((task) => (
                        <TaskItem
                            key={task.id}
                            {...task}
                            onToggle={toggleTask}
                            onDelete={deleteTask}
                            onEdit={editTask}
                        />
                    ))}
                </div>
            )}

            {/* Completed tasks */}
            {completed.length > 0 && (
                <div className="space-y-1">
                    <button
                        onClick={() => setShowCompleted((v) => !v)}
                        className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full py-1"
                    >
                        <ChevronDown
                            size={14}
                            className={cn("transition-transform", !showCompleted && "-rotate-90")}
                        />
                        {completed.length} concluída{completed.length !== 1 ? "s" : ""}
                    </button>

                    {showCompleted && (
                        <div className="space-y-0.5">
                            {completed.map((task) => (
                                <TaskItem
                                    key={task.id}
                                    {...task}
                                    onToggle={toggleTask}
                                    onDelete={deleteTask}
                                    onEdit={editTask}
                                />
                            ))}

                            <div className="pt-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-muted-foreground h-7"
                                    onClick={clearCompleted}
                                >
                                    Limpar concluídas
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
