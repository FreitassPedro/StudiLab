import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSubjectsMap, useUpdateSubject } from "@/hooks/useSubjects";
import { useDeleteTopic, useTopicsMap, useUpdateTopic } from "@/hooks/useTopics";
import { FileText, Pencil, Trash2, BookOpen } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { toast } from "sonner";

const EMOJIS = [
    "📐", "⚡", "🔬", "🧬", "🏛️", "🌍", "📖", "💭", "👥",
    "💻", "📰", "📜", "🔢", "🤝", "📚", "🚔", "📑", "💰", "🏠", "👷", "⚖️", "🧰"
];
export function EditTopicDialog({
    topicId,
    children,
}: {
    topicId: string;
    children?: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");

    const updateTopic = useUpdateTopic();
    const deleteTopic = useDeleteTopic();
    const topicsMap = useTopicsMap();

    const topic = topicsMap?.[topicId];

    const handleOpenChange = (open: boolean) => {
        if (open && topic) {
            setName(topic.name);
        }
        setIsOpen(open);
    };

    const handleSave = async () => {
        if (!topic) return;

        const nextName = name.trim();
        if (!nextName) {
            toast.error("Informe um nome para o tópico.");
            return;
        }

        try {
            await updateTopic.mutateAsync({ topicId: topic.id, name: nextName });
            toast.success("Tópico atualizado com sucesso.");
            setIsOpen(false);
        } catch {
            toast.error("Erro ao atualizar tópico.");
        }
    };

    const handleDeleteTopic = async () => {
        const label = topic?.name ?? topicId;
        if (!confirm(`Tem certeza que deseja excluir o tópico "${label}"? Esta ação não pode ser desfeita.`)) {
            return;
        }

        try {
            await deleteTopic.mutateAsync(topicId);
            toast.info("Tópico removido com sucesso.");
            setIsOpen(false);
        } catch {
            toast.error("Erro ao remover tópico.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children ?? (
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Editar tópico</DialogTitle>
                <DialogDescription>
                    Altere o nome do tópico ou remova-o da matéria.
                </DialogDescription>

                <div className="flex flex-col gap-4 mt-4">
                    <div className="flex flex-row items-center gap-2 w-full">
                        <FileText className="text-muted-foreground/50 shrink-0" />
                        <Input
                            placeholder="Nome do tópico"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleDeleteTopic}
                            disabled={deleteTopic.isPending || updateTopic.isPending}
                        >
                            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                            Excluir
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSave}
                            disabled={updateTopic.isPending || deleteTopic.isPending || !name.trim()}
                        >
                            {updateTopic.isPending ? "Salvando..." : "Salvar"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function EditSubjectDialog({
    subjectId,
    children,
}: {
    subjectId: string;
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);

    const updateSubject = useUpdateSubject();

    const { data: subjectsMap } = useSubjectsMap();
    const subject = subjectsMap?.[subjectId];

    const [color, setColor] = useState(subject?.color ?? "#000000");
    const [name, setName] = useState(subject?.name ?? "");
    const [icon, setIcon] = useState(subject?.icon ?? "📚");

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColor(e.target.value);
    }

    const handleOpenChange = (open: boolean) => {
        if (subject && open) {
            setColor(subject.color);
            setName(subject.name);
            setIcon(subject.icon ?? "📚");
        }

        setIsOpen(open);
    };

    const handleSave = async () => {
        if (!subject) return;
        try {
            await updateSubject.mutateAsync({ id: subject.id, name: name || subject.name, color: color || subject.color, icon: icon || null });
            setIsOpen(false);
        } catch {
            // Handle error (e.g., show a toast)
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange} >
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Editar Matéria</DialogTitle>
                <div className="flex flex-row items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="rounded-md border flex items-center justify-center w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                                style={{ backgroundColor: color + "22", borderColor: color }}
                            >
                                {icon ? (
                                    <span className="text-xl">{icon}</span>
                                ) : (
                                    <BookOpen size={20} style={{ color }} />
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48 grid grid-cols-4 gap-2 p-2">
                            {EMOJIS.map((emoji) => (
                                <DropdownMenuItem
                                    key={emoji}
                                    onClick={() => setIcon(emoji)}
                                    className="flex items-center justify-center text-xl p-2 cursor-pointer rounded-md hover:bg-muted shadow-sm"
                                >
                                    {emoji}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div
                        className="w-8 h-8 rounded-full flex-shrink-0 relative overflow-hidden cursor-pointer shadow-sm"
                        style={{ backgroundColor: color }}
                    >
                        <Input
                            type="color"
                            value={color}
                            defaultValue={color}
                            onChange={handleColorChange}
                            className="absolute inset-0 w-[200%] h-[200%] -top-[50%] -left-[50%] opacity-0 cursor-pointer"
                        />

                    </div>
                    <Input
                        placeholder="Nome da matéria"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <Button
                    onClick={handleSave}
                    className="mt-4"
                    size={"sm"}
                >
                    Salvar
                </Button>
            </DialogContent>
        </Dialog>
    );
};