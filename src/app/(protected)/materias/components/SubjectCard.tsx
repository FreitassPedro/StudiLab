"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Plus, Settings, Trash2, X } from "lucide-react";
import { deleteSubjectAction } from "@/server/actions/subject.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUpdateSubject } from "@/hooks/useSubjects";
import { useCreateTopic, useDeleteTopic, useUpdateTopic } from "@/hooks/useTopics";
import { useState } from "react";

interface Subject {
    id: string;
    name: string;
    color: string;
    topics: Topic[];
}

interface Topic {
    id: string;
    name: string;
}

const EditTopicDialog = ({ topic, open, onOpenChange, onSave }: { topic: Topic | null; open: boolean; onOpenChange: (open: boolean) => void; onSave: (name: string) => void }) => {
    const [topicName, setTopicName] = useState(topic?.name || '');
    const updateTopic = useUpdateTopic();

    const handleSave = async () => {
        if (!topicName.trim()) {
            toast.error('Nome do tópico não pode ser vazio');
            return;
        }

        if (!topic) return;

        try {
            await updateTopic.mutateAsync({ topicId: topic.id, name: topicName });
            toast.success('Tópico atualizado com sucesso');
            onSave(topicName);
            onOpenChange(false);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar tópico';
            toast.error(errorMessage);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Editar Tópico</DialogTitle>
                    <DialogDescription>
                        Altere o nome do tópico.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <Input
                        value={topicName}
                        onChange={(e) => setTopicName(e.target.value)}
                        placeholder="Nome do tópico"
                        autoFocus
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={updateTopic.isPending}>
                        {updateTopic.isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const EditSubjectDialog = ({ open, onOpenChange, subject, topics }: { open: boolean; onOpenChange: (open: boolean) => void; subject: { id: string; name: string; color: string }; topics: Topic[] }) => {
    const updateSubject = useUpdateSubject();
    const createTopic = useCreateTopic();
    const deleteTopic = useDeleteTopic();

    // Estado local único para o formulário
    const [formData, setFormData] = useState(subject);
    const [localTopics, setLocalTopics] = useState(topics);
    const [isEditingField, setIsEditingField] = useState('');
    const [newTopicName, setNewTopicName] = useState('');
    const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
    const [isEditTopicDialogOpen, setIsEditTopicDialogOpen] = useState(false);

    const handleEdit = (field: string) => () => {
        setIsEditingField(field);
    };

    const handleAddTopic = async () => {
        if (!newTopicName.trim()) {
            toast.error('Nome do tópico não pode ser vazio');
            return;
        }

        try {
            const newTopic = await createTopic.mutateAsync({
                name: newTopicName,
                subjectId: subject.id,
                parentId: null,
            });
            setLocalTopics([...localTopics, newTopic]);
            setNewTopicName('');
            toast.success('Tópico adicionado com sucesso');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao adicionar tópico';
            toast.error(errorMessage);
        }
    };

    const handleDeleteTopic = async (topicId: string, topicName: string) => {
        if (!confirm(`Tem certeza que deseja excluir o tópico "${topicName}"?`)) return;

        try {
            await deleteTopic.mutateAsync(topicId);
            setLocalTopics(localTopics.filter(t => t.id !== topicId));
            toast.success('Tópico excluído com sucesso');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir tópico';
            toast.error(errorMessage);
        }
    };

    const handleRenameTopic = async (topicId: string) => {
        const topic = localTopics.find(t => t.id === topicId);
        if (topic) {
            setEditingTopic(topic);
            setIsEditTopicDialogOpen(true);
        }
    }

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('Nome não pode ser vazio');
            return;
        }

        try {
            await updateSubject.mutateAsync(formData);
            toast.success('Matéria atualizada com sucesso');
            onOpenChange(false);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar matéria';
            toast.error(errorMessage);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Matéria</DialogTitle>
                        <DialogDescription>
                            Faça alterações na matéria e tópicos associados.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Campo de Nome e Cor combinados */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                    className="h-6 w-6 cursor-pointer appearance-none rounded-full border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none"
                                    title="Alterar cor"
                                    onClick={handleEdit("color")}
                                />
                            </div>
                            {isEditingField === 'name' ? (
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Nome da matéria"
                                    className="flex-1"
                                    autoFocus
                                    onBlur={() => setIsEditingField('')}
                                />
                            ) : (
                                <h2 onClick={handleEdit("name")} className="cursor-pointer flex-1">{formData.name}</h2>
                            )}
                        </div>

                        {/* Seção de Tópicos */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Tópicos ({localTopics.length})
                            </label>

                            {/* Lista de Tópicos com opção de deletar */}
                            {localTopics.length > 0 ? (
                                <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/20 max-h-40 overflow-y-auto">
                                    {localTopics.map((topic) => (
                                        <div
                                            key={topic.id}
                                            className="text-xs bg-background border px-2 py-1 rounded-md shadow-sm font-medium flex-row flex items-center gap-1"
                                        >
                                            {topic.name}

                                            <button
                                                onClick={() => handleRenameTopic(topic.id)}
                                                className="hover:text-primary ml-1"
                                                type="button"
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTopic(topic.id, topic.name)}
                                                className="hover:text-destructive ml-1"
                                                type="button"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">
                                    Nenhum tópico associado.
                                </p>
                            )}
                        </div>

                        {/* Adicionar novo tópico */}
                        <div className="flex gap-2">
                            <Input
                                value={newTopicName}
                                onChange={(e) => setNewTopicName(e.target.value)}
                                placeholder="Nome do novo tópico"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddTopic();
                                    }
                                }}
                            />
                            <Button
                                size="sm"
                                onClick={handleAddTopic}
                                disabled={createTopic.isPending || !newTopicName.trim()}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={updateSubject.isPending}>
                            {updateSubject.isPending ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <EditTopicDialog 
                topic={editingTopic} 
                open={isEditTopicDialogOpen} 
                onOpenChange={setIsEditTopicDialogOpen} 
                onSave={(newName) => {
                    if (editingTopic) {
                        setLocalTopics(localTopics.map(t => 
                            t.id === editingTopic.id ? { ...t, name: newName } : t
                        ));
                    }
                }} 
            />

        </>
    );
};

interface SubjectCardProps {
    subject: Subject;
}

export function SubjectCard({ subject }: SubjectCardProps) {
    const router = useRouter();

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Tem certeza que deseja excluir "${subject.name}"?`)) return;

        try {
            await deleteSubjectAction(subject.id);
            toast.success("Matéria excluída");
            router.refresh();
        } catch (error) {
            toast.error("Erro ao excluir matéria");
            console.error(error);
        }
    };

    return (
        <>
            <Card className="">
                <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: subject.color }}
                        />
                        <span className="font-medium text-foreground">{subject.name}</span>
                    </div>
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            title="Adicionar tópico"
                        >
                            <Plus className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDelete}
                            title="Excluir matéria"
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <Button
                            onClick={() => setIsEditDialogOpen(true)}
                            variant="ghost"
                            size="icon"
                        >
                            <Settings className="h-4 w-4 " />
                        </Button>
                    </div>
                </CardContent>
                {subject.topics.length > 0 && (
                    <div className="px-3 pb-3 flex flex-wrap gap-2">
                        {subject.topics.map((topic) => (
                            <span
                                key={topic.id}
                                className="text-xs bg-muted px-2 py-1 rounded"
                            >
                                {topic.name}
                            </span>
                        ))}
                    </div>
                )}
            </Card>

            <EditSubjectDialog subject={subject} topics={subject.topics} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
        </>
    );
}
