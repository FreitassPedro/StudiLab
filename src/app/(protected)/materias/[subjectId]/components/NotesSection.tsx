"use client";

import { useState, useRef, useEffect } from "react";
import { Pin, PinOff, Trash2, Palette, Plus, StickyNote } from "lucide-react";
import {
    useSubjectNotes,
    NOTE_COLORS,
    NOTE_COLOR_STYLES,
    NoteColor,
    SubjectNote,
} from "@/hooks/useSubjectNotes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Create Note Input ────────────────────────────────────────────────────────

function CreateNoteInput({ onSave }: { onSave: (title: string, content: string, color: NoteColor) => void }) {
    const [expanded, setExpanded] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [color, setColor] = useState<NoteColor>("default");
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSave = () => {
        if (!title.trim() && !content.trim()) {
            setExpanded(false);
            return;
        }
        onSave(title.trim(), content.trim(), color);
        setTitle("");
        setContent("");
        setColor("default");
        setExpanded(false);
    };

    // Close on click outside
    useEffect(() => {
        if (!expanded) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                handleSave();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expanded, title, content, color]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "rounded-2xl border shadow-md transition-all duration-200 overflow-hidden",
                NOTE_COLOR_STYLES[color],
                expanded ? "shadow-lg" : "cursor-text hover:shadow-md"
            )}
            onClick={() => !expanded && setExpanded(true)}
        >
            {expanded ? (
                <div className="p-4 space-y-2">
                    <input
                        autoFocus
                        placeholder="Título"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-transparent font-semibold text-sm placeholder:text-muted-foreground/50 outline-none"
                    />
                    <textarea
                        placeholder="Anotação..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={3}
                        className="w-full bg-transparent text-sm placeholder:text-muted-foreground/50 outline-none resize-none"
                    />
                    {/* Color picker */}
                    <div className="flex items-center gap-2 pt-1">
                        <Palette size={14} className="text-muted-foreground" />
                        <div className="flex gap-1.5 flex-wrap">
                            {NOTE_COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    title={c.label}
                                    onClick={() => setColor(c.value)}
                                    className={cn(
                                        "w-5 h-5 rounded-full border-2 transition-all",
                                        c.value === "default" ? "bg-card border-border" : "",
                                        c.value === "red" ? "bg-red-300 dark:bg-red-700" : "",
                                        c.value === "orange" ? "bg-orange-300 dark:bg-orange-700" : "",
                                        c.value === "yellow" ? "bg-yellow-300 dark:bg-yellow-600" : "",
                                        c.value === "green" ? "bg-emerald-300 dark:bg-emerald-700" : "",
                                        c.value === "blue" ? "bg-blue-300 dark:bg-blue-700" : "",
                                        c.value === "purple" ? "bg-violet-300 dark:bg-violet-700" : "",
                                        color === c.value ? "border-foreground scale-110" : "border-transparent"
                                    )}
                                />
                            ))}
                        </div>
                        <div className="flex-1" />
                        <Button size="sm" variant="ghost" onClick={() => { setExpanded(false); setTitle(""); setContent(""); }}>
                            Cancelar
                        </Button>
                        <Button size="sm" onClick={handleSave}>
                            Salvar
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3 px-4 py-3">
                    <Plus size={16} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Nova anotação...</span>
                </div>
            )}
        </div>
    );
}

// ─── Note Card ────────────────────────────────────────────────────────────────

function NoteCard({
    note,
    onUpdate,
    onDelete,
    onTogglePin,
}: {
    note: SubjectNote;
    onUpdate: (id: string, patch: Partial<SubjectNote>) => void;
    onDelete: (id: string) => void;
    onTogglePin: (id: string) => void;
}) {
    const [editingTitle, setEditingTitle] = useState(false);
    const [editingContent, setEditingContent] = useState(false);
    const [titleVal, setTitleVal] = useState(note.title);
    const [contentVal, setContentVal] = useState(note.content);
    const [showActions, setShowActions] = useState(false);

    const saveTitle = () => {
        onUpdate(note.id, { title: titleVal });
        setEditingTitle(false);
    };

    const saveContent = () => {
        onUpdate(note.id, { content: contentVal });
        setEditingContent(false);
    };

    const colorStyle = NOTE_COLOR_STYLES[note.color as NoteColor] ?? NOTE_COLOR_STYLES.default;

    return (
        <div
            className={cn(
                "group relative rounded-2xl border p-4 space-y-2 transition-all duration-200 hover:shadow-md",
                colorStyle,
                note.isPinned && "ring-1 ring-primary/30"
            )}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {/* Pin indicator */}
            {note.isPinned && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm">
                    <Pin size={10} className="text-primary-foreground" fill="currentColor" />
                </div>
            )}

            {/* Title */}
            {editingTitle ? (
                <input
                    autoFocus
                    value={titleVal}
                    onChange={(e) => setTitleVal(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                    className="w-full bg-transparent font-semibold text-sm outline-none"
                />
            ) : (
                <p
                    className={cn("font-semibold text-sm cursor-text leading-tight", !note.title && "text-muted-foreground/40 italic")}
                    onClick={() => setEditingTitle(true)}
                >
                    {note.title || "Sem título"}
                </p>
            )}

            {/* Content */}
            {editingContent ? (
                <textarea
                    autoFocus
                    value={contentVal}
                    onChange={(e) => setContentVal(e.target.value)}
                    onBlur={saveContent}
                    rows={4}
                    className="w-full bg-transparent text-sm outline-none resize-none"
                />
            ) : (
                <p
                    className={cn(
                        "text-sm text-foreground/80 cursor-text whitespace-pre-wrap leading-relaxed",
                        !note.content && "text-muted-foreground/40 italic"
                    )}
                    onClick={() => setEditingContent(true)}
                >
                    {note.content || "Escreva algo..."}
                </p>
            )}

            {/* Timestamp */}
            <p className="text-[10px] text-muted-foreground/50 pt-1">
                {new Date(note.updatedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </p>

            {/* Action bar */}
            <div
                className={cn(
                    "flex items-center gap-1 pt-1 border-t border-black/5 dark:border-white/5 transition-all duration-150",
                    showActions ? "opacity-100" : "opacity-0"
                )}
            >
                <button
                    title={note.isPinned ? "Desafixar" : "Fixar"}
                    onClick={() => onTogglePin(note.id)}
                    className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                >
                    {note.isPinned ? <PinOff size={13} /> : <Pin size={13} />}
                </button>
                <div className="flex-1" />
                <button
                    title="Excluir"
                    onClick={() => onDelete(note.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function NotesSection({ subjectId }: { subjectId: string }) {
    const { notes, addNote, updateNote, deleteNote, togglePin } = useSubjectNotes(subjectId);

    const pinned = notes.filter((n) => n.isPinned);
    const others = notes.filter((n) => !n.isPinned);

    return (
        <div className="space-y-6">
            <CreateNoteInput onSave={(title, content, color) => addNote(title, content, color)} />

            {notes.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center">
                        <StickyNote size={22} className="text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">Nenhuma anotação ainda.</p>
                    <p className="text-xs text-muted-foreground/60">Clique acima para criar sua primeira nota!</p>
                </div>
            )}

            {/* Pinned group */}
            {pinned.length > 0 && (
                <div className="space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <Pin size={10} /> Fixadas
                    </p>
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                        {pinned.map((note) => (
                            <div key={note.id} className="break-inside-avoid">
                                <NoteCard
                                    note={note}
                                    onUpdate={updateNote}
                                    onDelete={deleteNote}
                                    onTogglePin={togglePin}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Others group */}
            {others.length > 0 && (
                <div className="space-y-3">
                    {pinned.length > 0 && (
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                            Outras notas
                        </p>
                    )}
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                        {others.map((note) => (
                            <div key={note.id} className="break-inside-avoid">
                                <NoteCard
                                    note={note}
                                    onUpdate={updateNote}
                                    onDelete={deleteNote}
                                    onTogglePin={togglePin}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
