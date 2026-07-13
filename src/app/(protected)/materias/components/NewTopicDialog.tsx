"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateTopic } from "@/hooks/useTopics";
import { Topic } from "@/types/types";
import { useSubjectsMap } from "@/hooks/useSubjects";

interface Props {
    subjectId: string;
    parentId?: string | null;
    onTopicCreated?: (topic: Topic) => void;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
}
export function NewTopicDialog({
    isOpen,
    onOpenChange,
    subjectId,
    parentId = null,
    onTopicCreated,
    children
}: Props) {
    const [internalOpen, setInternalOpen] = useState(false);
    const [name, setName] = useState("");
    const createTopic = useCreateTopic();
    const isControlled = typeof isOpen === "boolean" && typeof onOpenChange === "function";
    const open = isControlled ? isOpen : internalOpen;
    const setOpen = isControlled ? onOpenChange : setInternalOpen;

    const { data: subjects } = useSubjectsMap();
    const subject = subjects?.[subjectId];

    if (!subject) return null;

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!name.trim()) return;

        try {
            const topic = await createTopic.mutateAsync({ name: name.trim(), subjectId: subject.id, parentId });
            toast.success(`Tópico "${topic.name}" criado!`);
            onTopicCreated?.(topic);
            setName("");
            setOpen(false);
        } catch {
            toast.error("Erro ao criar tópico.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
            <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>Novo tópico em &quot;{subject.name}&quot;</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="topic-name">Nome do tópico</Label>
                        <Input
                            id="topic-name"
                            placeholder="Ex: Equações diferenciais"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={createTopic.isPending || !name.trim()}>
                            {createTopic.isPending ? "Criando..." : "Criar"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
