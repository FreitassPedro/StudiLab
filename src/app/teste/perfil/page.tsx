"use client";

import React, { useState, useMemo } from 'react';
import { 
  Settings, Share2, Flame, Clock, BookOpen, 
  Target, Award, Moon, Zap, BrainCircuit
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip 
} from 'recharts';

// Tipagens e Geração de Dados Mockados
type HeatmapDay = { date: string; count: number };
type Goal = { title: string; date: string; daysLeft: number; progress: number; color: string; icon: React.ReactNode };
type Badge = { id: string; name: string; description: string; unlocked: boolean; icon: React.ReactNode; color: string };

const FOCUS_DATA = [
  { name: 'Matemática', value: 35, color: '#10b981' },
  { name: 'Física', value: 25, color: '#3b82f6' },
  { name: 'Programação', value: 25, color: '#8b5cf6' },
  { name: 'Inglês', value: 15, color: '#f59e0b' },
];

const MOCK_GOALS: Goal[] = [
  { title: 'ENEM 2024', date: '03 Nov 2024', daysLeft: 120, progress: 65, color: 'from-emerald-400 to-emerald-600', icon: <Target className="w-5 h-5 text-emerald-400" /> },
  { title: 'Vestibular UFPel', date: '15 Dez 2024', daysLeft: 162, progress: 30, color: 'from-blue-400 to-blue-600', icon: <BookOpen className="w-5 h-5 text-blue-400" /> },
];

const MOCK_BADGES: Badge[] = [
  { id: '1', name: 'Maratonista', description: 'Mais de 6h em um único dia', unlocked: true, icon: <Zap className="w-6 h-6" />, color: 'text-amber-400 bg-amber-400/10' },
  { id: '2', name: 'Coruja', description: 'Estudou após as 00h', unlocked: true, icon: <Moon className="w-6 h-6" />, color: 'text-indigo-400 bg-indigo-400/10' },
  { id: '3', name: 'Mestre da Lógica', description: 'Gabaritou lista de Física', unlocked: false, icon: <BrainCircuit className="w-6 h-6" />, color: 'text-slate-400 bg-slate-800' },
];

export default function ProfilePage() {
  // Geração de Heatmap baseada em parseamento de data local para evitar deslocamento UTC
  const heatmapData = useMemo<HeatmapDay[]>(() => {
    const data: HeatmapDay[] = [];
    const today = new Date();
    
    for (let i = 89; i >= 0; i--) {
      // Instanciação com componentes locais garante a integridade da data no fuso do cliente
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      data.push({
        date: dateString,
        count: Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0,
      });
    }
    return data;
  }, []);

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-white/5 border-white/5';
    if (count === 1) return 'bg-emerald-500/20 border-emerald-500/20';
    if (count === 2) return 'bg-emerald-500/40 border-emerald-500/30';
    if (count === 3) return 'bg-emerald-500/70 border-emerald-500/50';
    return 'bg-emerald-500 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER / CAPA */}
        <section className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50 backdrop-blur-xl">
          <div className="h-32 w-full bg-gradient-to-r from-emerald-600/20 via-blue-900/20 to-slate-900/20 absolute top-0 left-0" />
          <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-end gap-6 mt-12">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full border-4 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden relative">
                {/* Avatar Placeholder */}
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=1e293b" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              {/* Anel Premium indicando longa ofensiva */}
              <div className="absolute -inset-1 rounded-full border-2 border-amber-500/80 animate-[spin_10s_linear_infinite] [mask-image:linear-gradient(transparent,black)] pointer-events-none" />
              <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-amber-500/50 text-amber-500 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 shadow-lg shadow-amber-500/20">
                PRO
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-white">Pedro Freitas</h1>
              <p className="text-emerald-400 font-medium">@pedro.dev</p>
              <p className="text-slate-400 mt-2 max-w-lg text-sm">Transição arquitetural para Engenharia de Software. Foco no domínio de estruturas subjacentes em Ciência da Computação.</p>
            </div>

            <div className="flex gap-3 mt-4 md:mt-0 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-sm font-medium">
                <Share2 className="w-4 h-4" /> Compartilhar
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl transition-all text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Settings className="w-4 h-4" /> Editar Perfil
              </button>
            </div>
          </div>
        </section>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* HERO STATS - Coluna Esquerda (Mobile) / Topo (Desktop) */}
          <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 relative">
                <Flame className="w-6 h-6 text-orange-500 relative z-10 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Ofensiva Atual</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">42</span>
                  <span className="text-xs text-slate-500">dias</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Tempo Total (Mês)</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">124</span>
                  <span className="text-xs text-slate-500">horas</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Award className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Tópicos Dominados</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">89</span>
                  <span className="text-xs text-slate-500">cards</span>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN COLUMN - HEATMAP & METAS */}
          <div className="md:col-span-8 space-y-6">
            
            {/* HEATMAP */}
            <section className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white">Consistência de Estudo</h2>
                <span className="text-xs font-medium px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                  Últimos 90 dias
                </span>
              </div>
              
              <div className="overflow-x-auto pb-2">
                <div className="min-w-[700px] flex gap-1.5 flex-wrap flex-col h-[110px] content-start">
                  {heatmapData.map((day, index) => (
                    <div 
                      key={index}
                      className={`w-3.5 h-3.5 rounded-sm border ${getHeatmapColor(day.count)} transition-all duration-300 hover:scale-125 cursor-crosshair group relative`}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-xs text-slate-200 rounded border border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                        {day.count} registros em {day.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-4 text-xs text-slate-400">
                <span>Menos</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map(level => (
                    <div key={level} className={`w-3 h-3 rounded-sm border ${getHeatmapColor(level)}`} />
                  ))}
                </div>
                <span>Mais</span>
              </div>
            </section>

            {/* METAS / BÚSSOLA */}
            <section className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Bússola de Objetivos</h2>
              <div className="space-y-4">
                {MOCK_GOALS.map((goal, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-950 border border-white/5">
                          {goal.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-200">{goal.title}</h3>
                          <p className="text-xs text-slate-400">{goal.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-white">{goal.daysLeft}</span>
                        <p className="text-xs text-slate-400">dias restantes</p>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full bg-gradient-to-r ${goal.color} relative`}
                        style={{ width: `${goal.progress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* SIDEBAR COLUMN - RADAR & BADGES */}
          <div className="md:col-span-4 space-y-6">
            
            {/* RADAR DE FOCO */}
            <section className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 h-[320px] flex flex-col">
              <h2 className="text-lg font-bold text-white mb-2">Distribuição de Foco</h2>
              <div className="flex-1 w-full relative -ml-4 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={FOCUS_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {FOCUS_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legenda Customizada */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-white">100%</span>
                  <span className="text-xs text-slate-400">Alocação</span>
                </div>
              </div>
            </section>

            {/* ESTANTE DE CONQUISTAS */}
            <section className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">Conquistas</h2>
                <span className="text-xs font-medium text-slate-400">2 de 15</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {MOCK_BADGES.map((badge) => (
                  <div 
                    key={badge.id} 
                    className={`flex items-center gap-3 p-3 rounded-xl border ${badge.unlocked ? 'border-white/10 bg-white/5' : 'border-transparent bg-slate-950/50 grayscale opacity-60'}`}
                  >
                    <div className={`p-2 rounded-lg ${badge.color}`}>
                      {badge.icon}
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${badge.unlocked ? 'text-slate-200' : 'text-slate-500'}`}>
                        {badge.name}
                      </h4>
                      <p className="text-xs text-slate-400">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
          </div>
        </div>
      </div>
    </div>
  );
}