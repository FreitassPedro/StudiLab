"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PaletteIcon, PenTool, Plus, SparkleIcon } from 'lucide-react';
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

    const previewSubject = {
        id: '1',
        name: "Teste",
        color: "#3B82F6",
        user_id: '1',
        created_at: "2026-06-28T22:30:42-03:00",
        updated_at: "2026-06-28T22:30:42-03:00",
    }
    return (
        <div className='grid grid-cols-1 md:grid-cols-6 gap-6'>
            <Card className='md:col-span-5 border-border/60 shadow-sm'>
                <CardHeader className="flex items-center justify-between">
                    <CardTitle>Nova Matéria</CardTitle>
                    <EnemSuggestionsDialog />

                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreate} className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="subjectName">Nome</Label>
                            <div className="flex items-center gap-2">
                                <div
                                    className={`rounded-md border-2 flex items-center justify-center p-2`}
                                    style={{ backgroundColor: rgbColor }}
                                >
                                    <SparkleIcon className="h-6 w-6 text-foreground" />
                                </div>
                                <Input
                                    id="subjectName"
                                    placeholder="Ex: Matemática, Biologia, Inglês..."
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    maxLength={50}
                                />
                            </div>

                        </div>

                        <div className="space-y-2">
                            <Label>Cor</Label>
                            <div className='flex flex-row space-x-2 items-center'>
                                <div className={`relative bg-card ${newColor === rgbColor
                                    ? 'border-foreground '
                                    : 'border-border/60'
                                    } border rounded-xl p-2 flex flex-row items-center justify-center gap-2`}>
                                    <PaletteIcon />

                                    <button
                                        type='button'
                                        onClick={() => colorInputRef.current?.click()}
                                        className={`w-6 h-6 rounded-full border-2 transition-transform 
                                            ${newColor === rgbColor
                                                ? 'border-foreground scale-110'
                                                : 'border-transparent'
                                            } flex items-center justify-center text-[10px] font-bold text-white`}
                                        style={{ backgroundColor: rgbColor }}
                                        title="Escolher cor personalizada">
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
                                            className={`w-6 h-6 rounded-full border-2 transition-transform ${newColor === color
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
            <div className='md:col-span-1 flex flex-col'>
                <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <SparkleIcon size={10} />
                    Pre visalização
                </div>
                <div className='bg-card relative rounded-2xl flex-1 overflow-hidden border border-border/60 shadow-lg min-h-[200px]'>
                    <div className='w-3 absolute left-0 inset-y-0' style={{ backgroundColor: previewSubject.color }} />
                    <div className='flex flex-col pl-6 py-4 pr-5 gap-3 h-full flex-1'>
                        {/* Icon */}
                        <div className='w-12 h-12 rounded-lg flex items-center justify-center shadow-sm'
                            style={{ backgroundColor: previewSubject.color }}>
                            <div className='font-bold text-sm'>
                                {previewSubject.name.charAt(0)}
                            </div>
                        </div>
                        <h4 className='font-semibold text-foreground text-base leading-tight'>{previewSubject.name}</h4>
                        {/* lines decorations */}
                        <div className='mt-auto space-y-1'>
                            {[100, 75, 50].map((percent) => (
                                <div key={percent}
                                    className='h-[2px] rounded-full'
                                    style={{ width: `${percent}%`, backgroundColor: previewSubject.color }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
