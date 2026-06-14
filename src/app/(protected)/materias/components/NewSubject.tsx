"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PenTool, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useCreateSubject } from '@/hooks/useSubjects';
import { useRouter } from 'next/navigation';
import { EnemSuggestionsDialog } from './EnemSuggestionsDialog';

const PRESET_COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

export function NewSubject() {
    const router = useRouter();
    const createSubject = useCreateSubject();
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

    const [rgbColor, setRgbColor] = React.useState('#f1f1f1');

    const colorInputRef = React.useRef<HTMLInputElement>(null);

    const handleRgbColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;
        setRgbColor(color);
        setNewColor(color);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newName.trim()) {
            toast.error('Digite o nome da matéria');
            return;
        }

        try {
            await createSubject.mutateAsync({
                name: newName.trim(),
                color: newColor,
            });
            router.refresh();
            setNewName('');
            setNewColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
            toast.success('Matéria criada!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao criar matéria';
            toast.error(errorMessage);
            console.error(error);
        }
    };


    return (
        <Card>
            <CardHeader className="flex items-center justify-between">
                <CardTitle>Nova Matéria</CardTitle>
                <EnemSuggestionsDialog />

            </CardHeader>
            <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="subjectName">Nome</Label>
                        <Input
                            id="subjectName"
                            placeholder="Ex: Matemática, Biologia, Inglês..."
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            maxLength={50}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Cor</Label>
                        <div className='flex flex-row space-x-2'>
                            <div className="relative">
                                <button
                                    type='button'
                                    onClick={() => colorInputRef.current?.click()}
                                    className={`w-8 h-8 rounded-full border-2 transition-transform ${newColor === rgbColor
                                        ? 'border-foreground scale-110'
                                        : 'border-transparent'
                                        } flex items-center justify-center text-[10px] font-bold text-white`}
                                    style={{ backgroundColor: rgbColor }}
                                    title="Escolher cor personalizada">
                                    <span className="w-4 h-4"><PenTool /></span>
                                </button>
                                <input
                                    ref={colorInputRef}
                                    type="color"
                                    value={rgbColor}
                                    onChange={handleRgbColorChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                            <div className='border-r border-gray-300'></div>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setNewColor(color)}
                                        className={`w-8 h-8 rounded-full border-2 transition-transform ${newColor === color
                                            ? 'border-foreground scale-110'
                                            : 'border-transparent'
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <Button type="submit" disabled={createSubject.isPending} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        {createSubject.isPending ? 'Criando...' : 'Criar Matéria'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
