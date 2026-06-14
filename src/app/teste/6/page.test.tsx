"use client";
import React, { useState } from 'react';
import { History, Maximize2, Clock, Play } from 'lucide-react';

interface FormData {
  subjectId: string;
  topicId: string;
  material_type: string;
  study_date: string; // Simplificado para input type="date"
  start_time: string; // Simplificado para input type="time"
  end_time: string;   // Simplificado para input type="time"
  notes: string;
}

export default function Page() {
  const [formData, setFormData] = useState<FormData>({
    subjectId: '',
    topicId: '',
    material_type: 'revisao',
    study_date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de submissão
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Nova Sessão de Estudo</h1>
            <p className="text-sm text-slate-500 mt-1">Registre o ciclo de aprendizado atual.</p>
          </div>
          <button 
            type="button" 
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition-colors"
          >
            <History className="w-4 h-4" />
            <span>Retomar anterior</span>
          </button>
        </div>

        {/* Categoria e Tópico */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Matéria</label>
            <select 
              className="w-full h-10 px-3 rounded-md border border-slate-200 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={formData.subjectId}
              onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
            >
              <option value="" disabled>Selecione a disciplina</option>
              <option value="cs101">Introdução à Ciência da Computação</option>
              <option value="math201">Cálculo I</option>
              <option value="phys101">Física I</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tópico Estudado</label>
            <input 
              type="text"
              placeholder="Ex: Recursão, Leis de Newton"
              className="w-full h-10 px-3 rounded-md border border-slate-200 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={formData.topicId}
              onChange={(e) => setFormData({...formData, topicId: e.target.value})}
            />
          </div>
        </div>

        {/* Modalidade (Segmented Control Simplificado) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Modo de Estudo</label>
          <div className="flex p-1 bg-slate-100 rounded-lg">
            {['Teoria', 'Revisão', 'Exercícios', 'Resumo'].map((mode) => {
              const value = mode.toLowerCase();
              const isActive = formData.material_type === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({...formData, material_type: value})}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    isActive 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        {/* Controle Temporal */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</label>
            <input 
              type="date"
              className="w-full h-9 px-2 rounded border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
              value={formData.study_date}
              onChange={(e) => setFormData({...formData, study_date: e.target.value})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Início</label>
            <div className="relative">
              <input 
                type="time"
                className="w-full h-9 pl-8 pr-2 rounded border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
              />
              <Play className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fim</label>
            <div className="relative">
              <input 
                type="time"
                className="w-full h-9 pl-8 pr-2 rounded border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
                value={formData.end_time}
                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
              />
              <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Anotações */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label className="text-sm font-medium text-slate-700">Anotações</label>
            <span className="text-xs text-slate-400">Opcional</span>
          </div>
          <textarea 
            rows={3}
            className="w-full p-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Registre dúvidas, equações difíceis ou conceitos-chave..."
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />
        </div>

        {/* Ações */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-4 border-t border-slate-100">
          <button 
            type="button"
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <div className="w-full sm:flex-1 flex justify-end gap-3">
            <button 
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
              Modo Foco
            </button>
            <button 
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-sm"
            >
              Registrar Sessão
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}