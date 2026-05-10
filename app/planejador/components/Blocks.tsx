import { useCallback, useId, useMemo } from "react";
import { BlockType, StudyBlock, SubjectColor } from "./mockData";
import { COLOR_MAP, formatDuration, getBlockTimelineMetrics, parseTimeToMinutes } from "../utils";
import { CheckCircle2, Circle, Clock, GripVertical, MoreHorizontal, Pencil, Trash2, Trash2Icon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePlannerActions } from "./PlannerActionsContext";


interface BlockCardProps {
    block: StudyBlock;
    hourHeights: number[];
}

export function BlockCard({
    block,
    hourHeights,
}: BlockCardProps) {

    const {
        draggedId,
        resizingId,
        openEditBlock,
        removeBlock,
        handleDragStart,
        handleResizeStart,
        toggleBlockStatus,
    } = usePlannerActions();

    const colors = COLOR_MAP[block.color];
    const isDragging = draggedId === block.id;
    const isResizing = resizingId === block.id;

    const { topPx, heightPx } = useMemo(
        () => getBlockTimelineMetrics(block, hourHeights),
        [block, hourHeights]
    );

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if ((e.target as HTMLElement).closest("[data-resize-handle]")) return;
            e.preventDefault();

            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const offsetY = e.clientY - rect.top;
            handleDragStart(block.id, offsetY);
        },
        [block.id, handleDragStart]
    );

    const durationMin = useMemo(() => {
        const s = parseTimeToMinutes(block.startTime);
        const e = parseTimeToMinutes(block.endTime);
        return e - s;
    }, [block.startTime, block.endTime]);

    const compact = heightPx < 48;

    return (
        <div
            className={cn(
                "absolute z-10 group rounded-lg border select-none left-1 right-1",
                "transition-shadow overflow-hidden flex flex-col",
                colors.bg,
                colors.border,
                isDragging
                    ? "opacity-40 shadow-lg ring-2 ring-primary/50 cursor-grabbing"
                    : isResizing
                        ? "shadow-md ring-2 ring-primary/30 cursor-ns-resize"
                        : "cursor-grab hover:shadow-md hover:z-20",
                block.status === "done" && "opacity-60 grayscale-[0.3]"
            )}
            style={{
                height: `${heightPx}px`,
                top: `${topPx}px`,
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={(e) => {
                e.stopPropagation();
                openEditBlock(block);
            }}
        >
            {/* Drag grip */}
            <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none">
                <GripVertical className="w-3 h-3" />
            </div>

            <div className={cn("flex flex-col flex-1 min-h-0", compact ? "px-2 py-0.5" : "px-2 py-1.5")}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleBlockStatus(block.id);
                    }}
                    className="absolute opacity-0 hover:opacity-100"
                >
                    {block.status === "done" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-current opacity-80" />
                    ) : (
                        <Circle className="w-3.5 h-3.5 text-current opacity-40 hover:opacity-80 transition-opacity" />
                    )}
                </button>

                <h3 className={cn("font-semibold truncate leading-tight text-xs", colors.text)}>
                    {block.subject}
                </h3>

                {!compact && block.topic && (
                    <p className="text-xs text-muted-foreground truncate leading-tight">{block.topic}</p>
                )}

                {!compact && (
                    <Badge
                        variant="outline"
                        className={cn("w-fit text-xs mt-0.5 py-0 px-1.5 h-4", colors.border)}
                    >
                        {block.type}
                    </Badge>
                )}

                <div className={cn("flex items-center gap-0.5 text-muted-foreground leading-tight", compact ? "mt-0" : "mt-auto")}>
                    <Clock className="w-2.5 h-2.5 shrink-0" />
                    <p className="text-[10px] font-medium truncate">
                        {block.startTime}–{block.endTime}
                        {!compact && ` · ${formatDuration(durationMin)}`}
                    </p>
                </div>
            </div>

            {/* Options Button */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-6 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full"
                    >
                        <MoreHorizontal className="w-2.5 h-2.5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive"
                            onClick={() => removeBlock(block.id)}
                        >
                            <Trash2Icon />
                            Trash
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>


            {/* Edit button */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    openEditBlock(block);
                }}
            >
                <Pencil className="w-2.5 h-2.5 text-muted-foreground" />
            </Button>

            {/* Resize handle */}
            <div
                data-resize-handle
                className={cn(
                    "absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize",
                    "flex items-center justify-center opacity-0 group-hover:opacity-60 transition-opacity"
                )}
                onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log("resize start", block.id);
                    handleResizeStart(block.id, e);
                }}
            >
                <div className="w-8 h-0.5 rounded-full bg-current opacity-50" />
            </div>
        </div>
    );
}
// ── Color picker ────────────────────────────────────────────────────────────

const COLOR_OPTIONS: SubjectColor[] = [
    "blue", "emerald", "violet", "amber", "rose", "orange", "teal", "pink",
];

function normalizeSubjectName(subject: string): string {
    return subject
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function ColorPicker({
    value,
    onChange,
}: {
    value?: string;
    onChange: (c: SubjectColor) => void;
}) {
    const colorDots: Record<SubjectColor, string> = {
        blue: "bg-blue-400",
        emerald: "bg-emerald-400",
        violet: "bg-violet-400",
        amber: "bg-amber-400",
        rose: "bg-rose-400",
        orange: "bg-orange-400",
        teal: "bg-teal-400",
        pink: "bg-pink-400",
    };
    return (
        <div className="flex gap-2 flex-wrap">
            {COLOR_OPTIONS.map((c) => (
                <button
                    key={c}
                    type="button"
                    onClick={() => onChange(c)}
                    className={cn(
                        "w-6 h-6 rounded-full transition-all ring-offset-2",
                        colorDots[c],
                        value === c
                            ? "ring-2 ring-primary scale-110"
                            : "hover:scale-105 opacity-70 hover:opacity-100"
                    )}
                />
            ))}
        </div>
    );
}


// ── Block Form Modal ─────────────────────────────────────────────────────────

export function NewBlockFormModal({
    open,
    form,
    onCloseModal,
    onSave,
    onDelete,
    onFormChange,
    isEditing,
}: {
    open: boolean;
    form: Partial<StudyBlock>;
    onCloseModal: () => void;
    onSave: () => void;
    onDelete?: () => void;
    onFormChange: (patch: Partial<StudyBlock>) => void;
    isEditing?: boolean;
}) {

    const { allBlocks } = usePlannerActions();
    const subjectSuggestionsListId = useId().replace(/:/g, "");

    const colorBySubject = useMemo(() => {
        const map = new Map<string, SubjectColor>();
        for (const block of allBlocks) {
            const normalizedSubject = normalizeSubjectName(block.subject);
            if (!normalizedSubject || map.has(normalizedSubject)) {
                continue;
            }
            map.set(normalizedSubject, block.color);
        }
        return map;
    }, [allBlocks]);

    const subjectSuggestions = useMemo(() => {

        const map = new Map<string, string>();
        for (const block of allBlocks) {
            const trimmedSubject = block.subject.trim();
            const normalizedSubject = normalizeSubjectName(trimmedSubject);
            if (!normalizedSubject || map.has(normalizedSubject)) {
                continue;
            }
            map.set(normalizedSubject, trimmedSubject);
        }

        return Array.from(map.values()).sort((a, b) =>
            a.localeCompare(b, "pt-BR", { sensitivity: "base" })
        );
    }, [allBlocks]);

    const filteredSubjectSuggestions = useMemo(() => {
        const normalizedQuery = normalizeSubjectName(form.subject ?? "");
        if (!normalizedQuery) {
            return subjectSuggestions.slice(0, 12);
        }

        return subjectSuggestions
            .filter((subject) => normalizeSubjectName(subject).includes(normalizedQuery))
            .slice(0, 12);
    }, [form.subject, subjectSuggestions]);

    const handleSubjectChange = useCallback((subject: string) => {
        const normalizedSubject = normalizeSubjectName(subject);
        const matchedColor = normalizedSubject
            ? colorBySubject.get(normalizedSubject)
            : undefined;

        onFormChange({
            subject,
            ...(matchedColor ? { color: matchedColor } : {}),
        });
    }, [colorBySubject, onFormChange]);

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onCloseModal()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Editar bloco" : "Novo bloco de estudo"}
                    </DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3">
                    <div >
                        <Label className="text-xs text-muted-foreground mb-1 block">Matéria</Label>
                        <Input
                            placeholder="Ex: Matemática"
                            value={form.subject ?? ""}
                            onChange={(e) => handleSubjectChange(e.target.value)}
                            list={subjectSuggestionsListId}
                            autoFocus
                        />
                        <datalist id={subjectSuggestionsListId}>
                            {filteredSubjectSuggestions.map((subject) => (
                                <option key={subject} value={subject} />
                            ))}
                        </datalist>
                    </div>

                    <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Tópico</Label>
                        <Input
                            placeholder="Ex: Cálculo — Derivadas"
                            value={form.topic ?? ""}
                            onChange={(e) => onFormChange({ topic: e.target.value })}
                        />
                    </div>

                    <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Tipo</Label>
                        <div className="flex gap-2 flex-wrap">
                            {["study", "exercise", "review", "practice"].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => onFormChange({ type: t as BlockType })}
                                    className={cn(
                                        "px-3 py-1 rounded-full text-xs border transition-all",
                                        form.type === t
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "border-border text-muted-foreground hover:border-primary/50"
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Dia</Label>
                        {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((d, i) => (
                            <button
                                key={d}
                                type="button"
                                onClick={() => onFormChange({ dayIndex: i })}
                                className={cn(
                                    "px-3 py-1 rounded-full text-xs border transition-all",
                                    form.dayIndex === i
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "border-border text-muted-foreground hover:border-primary/50"
                                )}
                            >
                                {d}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Início</Label>
                            <Input
                                type="time"
                                value={form.startTime ?? "09:00"}
                                onChange={(e) => onFormChange({ startTime: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Fim</Label>
                            <Input
                                type="time"
                                value={form.endTime ?? "10:00"}
                                onChange={(e) => onFormChange({ endTime: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Cor</Label>
                        <ColorPicker
                            value={form.color as SubjectColor}
                            onChange={(c) => onFormChange({ color: c })}
                        />
                    </div>
                </div>

                <DialogFooter className="flex items-center justify-between mt-1">
                    <div>
                        {isEditing && onDelete && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={onDelete}
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-1" />
                                Excluir
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={onCloseModal}>
                            Cancelar
                        </Button>
                        <Button size="sm" onClick={onSave}>
                            Salvar
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Ghost block shown while dragging ────────────────────────────────────────

export function GhostBlock({
    topPx,
    heightPx,
    label,
}: {
    topPx: number;
    heightPx: number;
    label: string;
}) {
    return (
        <div
            className="absolute left-1 right-1 z-30 rounded-lg border-2 border-dashed border-primary/60 bg-primary/10 pointer-events-none flex items-center justify-center"
            style={{ top: `${topPx}px`, height: `${heightPx}px` }}
        >
            <p className="text-xs font-medium text-primary/70">{label}</p>
        </div>
    );
}