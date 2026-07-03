'use client';

import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  ResponsiveContainer,
} from "recharts";
import {
  Flame,
  Trophy,
  Crown,
  Clock,
  BookOpen,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FlaskConical,
  Target,
  Play,
  GripVertical,
  ChevronRight,
  Beaker,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* DATA (mock)                                                         */
/* ------------------------------------------------------------------ */

const weeklyData = [
  { day: "Seg", horas: 2.5, meta: true },
  { day: "Ter", horas: 3.2, meta: true },
  { day: "Qua", horas: 1.4, meta: false },
  { day: "Qui", horas: 4.1, meta: true },
  { day: "Sex", horas: 2.8, meta: true },
  { day: "Sáb", horas: 1.1, meta: false },
  { day: "Dom", horas: 3.6, meta: true },
];

const clockData = [
  { h: "06h", foco: 22 }, { h: "07h", foco: 31 }, { h: "08h", foco: 48 },
  { h: "09h", foco: 74 }, { h: "10h", foco: 91 }, { h: "11h", foco: 86 },
  { h: "12h", foco: 40 }, { h: "13h", foco: 33 }, { h: "14h", foco: 45 },
  { h: "15h", foco: 58 }, { h: "16h", foco: 62 }, { h: "17h", foco: 55 },
  { h: "18h", foco: 39 }, { h: "19h", foco: 47 }, { h: "20h", foco: 68 },
  { h: "21h", foco: 79 }, { h: "22h", foco: 60 }, { h: "23h", foco: 30 },
];

const subjectsData = [
  { name: "Matemática", value: 34, color: "#8B5CF6" },
  { name: "Física", value: 21, color: "#10B981" },
  { name: "Química", value: 16, color: "#F59E0B" },
  { name: "Biologia", value: 17, color: "#38BDF8" },
  { name: "Redação", value: 12, color: "#F472B6" },
];

const rankingData = [
  { name: "Marina T.", minutos: 312, initial: "M", color: "#F59E0B", rank: 1 },
  { name: "Você", minutos: 274, initial: "V", color: "#8B5CF6", rank: 2, isYou: true },
  { name: "Diego A.", minutos: 251, initial: "D", color: "#10B981", rank: 3 },
  { name: "Bia S.", minutos: 198, initial: "B", color: "#38BDF8", rank: 4 },
  { name: "Rafa M.", minutos: 165, initial: "R", color: "#F472B6", rank: 5 },
];

function generateHeatmap() {
  const cells = [];
  const weeks = 45;
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const recency = w / weeks;
      const base = Math.random();
      let intensity = base * (0.35 + recency * 0.65);
      if (w > weeks - 8) intensity = Math.max(intensity, Math.random() * 0.6 + 0.35);
      cells.push(Math.min(4, Math.floor(intensity * 5)));
    }
  }
  return cells;
}

const heatCellColor = [
  "rgba(255,255,255,0.05)",
  "rgba(139,92,246,0.28)",
  "rgba(139,92,246,0.52)",
  "rgba(139,92,246,0.78)",
  "#8B5CF6",
];

/* ------------------------------------------------------------------ */
/* SMALL UI PRIMITIVES                                                  */
/* ------------------------------------------------------------------ */

function Eyebrow({ children }) {
  return (
    <div className="inline-flex items-center gap-2 mb-4">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#8B5CF6" }} />
      <span
        className="text-xs tracking-[0.2em] uppercase font-semibold"
        style={{ color: "#A78BFA", fontFamily: "'JetBrains Mono', monospace" }}
      >
        {children}
      </span>
    </div>
  );
}

function LabFrame({ children, tag, className = "" }) {
  const corner =
    "absolute w-4 h-4 border-[color:var(--violet-light)]/40";
  return (
    <div className={`relative ${className}`}>
      <span className={`${corner} top-0 left-0 border-t-2 border-l-2 rounded-tl-md`} />
      <span className={`${corner} top-0 right-0 border-t-2 border-r-2 rounded-tr-md`} />
      <span className={`${corner} bottom-0 left-0 border-b-2 border-l-2 rounded-bl-md`} />
      <span className={`${corner} bottom-0 right-0 border-b-2 border-r-2 rounded-br-md`} />
      {tag && (
        <span
          className="absolute -top-3 left-4 px-2 py-0.5 text-[10px] tracking-wider uppercase font-semibold rounded"
          style={{
            background: "#0A0A14",
            color: "#A78BFA",
            border: "1px solid rgba(139,92,246,0.35)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {tag}
        </span>
      )}
      {children}
    </div>
  );
}

function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl backdrop-blur-xl ${className}`}
      style={{
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
      }}
    >
      {children}
    </div>
  );
}

function PrimaryButton({ children, className = "" }) {
  return (
    <button
      className={`group relative inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-[15px] transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] ${className}`}
      style={{
        background: "linear-gradient(135deg,#8B5CF6,#7C3AED)",
        color: "#fff",
        boxShadow: "0 0 0 1px rgba(139,92,246,0.4), 0 8px 30px rgba(139,92,246,0.35)",
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, className = "" }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-[15px] transition-all duration-200 hover:bg-white/5 ${className}`}
      style={{ border: "1px solid rgba(255,255,255,0.14)", color: "#F8FAFC" }}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* SECTIONS                                                            */
/* ------------------------------------------------------------------ */

function Nav() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4 mt-4 rounded-2xl backdrop-blur-xl"
        style={{ background: "rgba(10,10,20,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#8B5CF6,#10B981)" }}
          >
            <FlaskConical className="w-4.5 h-4.5 text-white" strokeWidth={2.3} />
          </div>
          <span className="font-extrabold text-lg tracking-tight" style={{ color: "#F8FAFC" }}>
            Studi<span style={{ color: "#A78BFA" }}>Lab</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "#94A3B8" }}>
          <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
          <a href="#gamificacao" className="hover:text-white transition-colors">Gamificação</a>
          <a href="#precos" className="hover:text-white transition-colors">Preços</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="hidden sm:inline text-sm font-semibold px-4 py-2" style={{ color: "#F8FAFC" }}>
            Entrar
          </button>
          <button
            className="text-sm font-semibold px-4 py-2.5 rounded-xl transition-transform hover:scale-105"
            style={{ background: "#8B5CF6", color: "#fff" }}
          >
            Criar conta grátis
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const [goal, setGoal] = useState(0);
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setGoal(78), 400);
    const t2 = setTimeout(() => setStreak(47), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const goalCircumference = 2 * Math.PI * 42;

  return (
    <section className="relative px-6 pt-20 pb-28 md:pt-28 md:pb-36 overflow-hidden">
      <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <Eyebrow>Seu laboratório de estudos</Eyebrow>
          <h1
            className="font-extrabold tracking-tight leading-[1.05] text-5xl md:text-6xl"
            style={{ color: "#F8FAFC", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Estude com método.
            <br />
            Não com <span style={{ color: "#8B5CF6" }}>sorte</span>.
          </h1>
          <p className="mt-6 text-lg leading-relaxed max-w-lg" style={{ color: "#94A3B8" }}>
            O StudiLab transforma cada hora de estudo em dado real: mostra seu
            horário de pico, sua ofensiva e exatamente o que falta pra bater a
            meta. Sem planilha, sem enrolação.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <PrimaryButton>
              Criar conta grátis <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </PrimaryButton>
            <GhostButton>
              <Play className="w-4 h-4" /> Explorar demonstração
            </GhostButton>
          </div>
          <p className="mt-5 text-xs" style={{ color: "#5B6272" }}>
            Grátis para sempre · sem cartão de crédito · leva 40 segundos
          </p>
        </div>

        {/* Floating dashboard mockup */}
        <div className="relative">
          <div
            className="absolute -inset-10 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ background: "radial-gradient(circle, #8B5CF6, transparent 70%)" }}
          />
          <LabFrame tag="Painel · tempo real" className="animate-[float_6s_ease-in-out_infinite]">
            <GlassCard className="p-6 relative">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs" style={{ color: "#5B6272", fontFamily: "'JetBrains Mono', monospace" }}>
                    RESUMO · SEMANA 24
                  </p>
                  <p className="font-bold text-lg mt-0.5" style={{ color: "#F8FAFC" }}>
                    Olá, futuro aprovado 👋
                  </p>
                </div>
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.3)" }}
                >
                  <Flame className="w-4 h-4" style={{ color: "#F59E0B" }} />
                  <span className="font-bold text-sm" style={{ color: "#F59E0B" }}>{streak} dias</span>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-5">
                <div className="col-span-2 flex flex-col items-center justify-center py-2">
                  <div className="relative w-28 h-28">
                    <svg className="w-28 h-28 -rotate-90">
                      <circle cx="56" cy="56" r="42" stroke="rgba(255,255,255,0.08)" strokeWidth="9" fill="none" />
                      <circle
                        cx="56" cy="56" r="42" stroke="#10B981" strokeWidth="9" fill="none"
                        strokeLinecap="round"
                        strokeDasharray={goalCircumference}
                        strokeDashoffset={goalCircumference - (goal / 100) * goalCircumference}
                        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-extrabold text-2xl" style={{ color: "#F8FAFC" }}>{goal}%</span>
                    </div>
                  </div>
                  <p className="text-xs mt-2 text-center" style={{ color: "#5B6272" }}>Meta diária</p>
                </div>

                <div className="col-span-3">
                  <p className="text-xs mb-2" style={{ color: "#5B6272" }}>Horas na semana</p>
                  <div style={{ height: 96 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData} barCategoryGap="28%">
                        <Bar dataKey="horas" radius={[5, 5, 5, 5]}>
                          {weeklyData.map((d, i) => (
                            <Cell key={i} fill={d.meta ? "#10B981" : "rgba(139,92,246,0.4)"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div
                className="mt-5 pt-4 flex items-center justify-between"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5" style={{ color: "#A78BFA" }} />
                  <span className="text-xs" style={{ color: "#94A3B8" }}>Pico de foco hoje: <b style={{ color: "#F8FAFC" }}>09h–11h</b></span>
                </div>
                <TrendingUp className="w-4 h-4" style={{ color: "#10B981" }} />
              </div>
            </GlassCard>
          </LabFrame>
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  const stats = [
    { value: "+10.482", label: "horas registradas esta semana" },
    { value: "+3.200", label: "estudantes ativos" },
    { value: "4.9/5", label: "avaliação média" },
    { value: "ENEM · Concursos · Faculdade", label: "feito pra alta performance" },
  ];
  return (
    <section className="px-6 py-10" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-8">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <Beaker className="w-4 h-4 shrink-0" style={{ color: "#8B5CF6" }} />
            <div>
              <p className="font-bold text-sm" style={{ color: "#F8FAFC" }}>{s.value}</p>
              <p className="text-xs" style={{ color: "#5B6272" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function WeekPlannerMockup() {
  const days = ["S", "T", "Q", "Q", "S"];
  const blocks = [
    { d: 0, top: 10, h: 22, color: "#8B5CF6", label: "Matemática" },
    { d: 0, top: 40, h: 16, color: "#10B981", label: "Física" },
    { d: 1, top: 15, h: 26, color: "#F59E0B", label: "Redação" },
    { d: 2, top: 8, h: 18, color: "#38BDF8", label: "Química" },
    { d: 2, top: 34, h: 20, color: "#8B5CF6", label: "Matemática" },
    { d: 3, top: 20, h: 24, color: "#F472B6", label: "Biologia" },
    { d: 4, top: 12, h: 20, color: "#10B981", label: "Física" },
  ];
  return (
    <div className="grid grid-cols-5 gap-1.5" style={{ height: 150 }}>
      {days.map((d, i) => (
        <div key={i} className="relative rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
          {blocks.filter((b) => b.d === i).map((b, j) => (
            <div
              key={j}
              className="absolute left-0.5 right-0.5 rounded-md flex items-center px-1 gap-0.5"
              style={{ top: `${b.top}%`, height: `${b.h}%`, background: `${b.color}2e`, border: `1px solid ${b.color}66` }}
            >
              <GripVertical className="w-2.5 h-2.5 shrink-0" style={{ color: b.color }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function HeatmapMockup() {
  const cells = useMemo(() => generateHeatmap(), []);
  return (
    <div
      className="grid gap-[3px]"
      style={{ gridTemplateColumns: "repeat(45, 1fr)", gridTemplateRows: "repeat(7, 1fr)", gridAutoFlow: "column", height: 96 }}
    >
      {cells.map((v, i) => (
        <div key={i} className="rounded-[2px]" style={{ background: heatCellColor[v] }} />
      ))}
    </div>
  );
}

function ClockMockup() {
  return (
    <div style={{ height: 130 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={clockData}>
          <defs>
            <linearGradient id="clockGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="foco" stroke="#A78BFA" strokeWidth={2} fill="url(#clockGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function SubjectsMockup() {
  const total = subjectsData.reduce((a, b) => a + b.value, 0);
  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: 110, height: 110 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={subjectsData} dataKey="value" innerRadius={34} outerRadius={52} paddingAngle={3} stroke="none">
              {subjectsData.map((s, i) => <Cell key={i} fill={s.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-extrabold text-sm" style={{ color: "#F8FAFC" }}>{total}h</span>
          <span className="text-[10px]" style={{ color: "#5B6272" }}>no mês</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 min-w-0">
        {subjectsData.slice(0, 4).map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
            <span style={{ color: "#94A3B8" }} className="truncate">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureCard({ tag, title, desc, children, className = "" }) {
  return (
    <GlassCard className={`p-6 flex flex-col ${className}`}>
      <p
        className="text-[10px] tracking-[0.18em] uppercase font-bold mb-3"
        style={{ color: "#8B5CF6", fontFamily: "'JetBrains Mono', monospace" }}
      >
        {tag}
      </p>
      <h3 className="font-extrabold text-xl mb-2" style={{ color: "#F8FAFC", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed mb-5" style={{ color: "#94A3B8" }}>{desc}</p>
      <div className="mt-auto">{children}</div>
    </GlassCard>
  );
}

function Features() {
  return (
    <section id="recursos" className="px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl mb-14">
          <Eyebrow>O laboratório, por dentro</Eyebrow>
          <h2
            className="font-extrabold text-4xl md:text-5xl tracking-tight leading-tight"
            style={{ color: "#F8FAFC", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Não é um bloco de notas.
            <br />É um instrumento de análise.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <FeatureCard
            tag="Planejador"
            title="Arraste. Solte. Estude."
            desc="Monte sua semana em blocos de estudo por matéria. Sem grade fixa, sem culpa — só o que cabe na sua rotina."
          >
            <WeekPlannerMockup />
          </FeatureCard>

          <FeatureCard
            tag="Histórico"
            title="Todo dia conta."
            desc="Um mapa de calor do seu ano inteiro de estudo. Enxergue seus dias fortes e corte as falhas antes que virem hábito."
          >
            <HeatmapMockup />
          </FeatureCard>

          <FeatureCard
            tag="Ritmo biológico"
            title="Descubra seu horário de pico."
            desc="O StudiLab cruza seus dados de foco e aponta exatamente em que horário do dia seu cérebro rende mais."
          >
            <ClockMockup />
            <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: "#A78BFA" }}>
              <Clock className="w-3.5 h-3.5" /> Seu pico: 09h–11h e 20h–22h
            </p>
          </FeatureCard>

          <FeatureCard
            tag="Matérias"
            title="Cada matéria, sua cor."
            desc="Organize por tópicos, acompanhe a distribuição do seu tempo e veja onde falta atenção antes da prova cobrar."
          >
            <SubjectsMockup />
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}

function Gamification() {
  return (
    <section id="gamificacao" className="px-6 py-28" style={{ background: "rgba(139,92,246,0.03)" }}>
      <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-8 items-stretch">
        <GlassCard className="p-9 flex flex-col justify-between">
          <div>
            <Eyebrow>Consistência</Eyebrow>
            <h3 className="font-extrabold text-3xl mb-3" style={{ color: "#F8FAFC", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Sua ofensiva é a prova.
            </h3>
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: "#94A3B8" }}>
              47 dias seguidos não é sorte, é hábito. Quanto mais tempo você
              mantém a chama acesa, mais alto sobe seu nível no laboratório.
            </p>
          </div>
          <div className="mt-10 flex items-end gap-4">
            <Flame className="w-16 h-16 animate-[flicker_2.4s_ease-in-out_infinite]" style={{ color: "#F59E0B" }} strokeWidth={1.8} />
            <div>
              <p className="font-extrabold text-5xl leading-none" style={{ color: "#F8FAFC" }}>47</p>
              <p className="text-xs mt-1 tracking-wide uppercase" style={{ color: "#F59E0B" }}>dias de ofensiva</p>
            </div>
          </div>
          <div className="mt-8 flex gap-1.5">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full" style={{ background: i < 11 ? "#F59E0B" : "rgba(255,255,255,0.08)" }} />
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-9">
          <Eyebrow>Ranking de amigos</Eyebrow>
          <h3 className="font-extrabold text-3xl mb-3" style={{ color: "#F8FAFC", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Estude perto de quem corre junto.
          </h3>
          <p className="text-sm leading-relaxed mb-7" style={{ color: "#94A3B8" }}>
            Compare seu tempo diário com o dos seus amigos e sinta a pressão boa da competição.
          </p>
          <div className="flex flex-col gap-3">
            {rankingData.map((r) => (
              <div
                key={r.rank}
                className="flex items-center gap-3 p-2.5 rounded-xl"
                style={r.isYou ? { background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)" } : {}}
              >
                <span className="w-5 text-center text-xs font-bold" style={{ color: "#5B6272" }}>
                  {r.rank === 1 ? <Crown className="w-4 h-4" style={{ color: "#F59E0B" }} /> : r.rank}
                </span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                  style={{ background: `${r.color}2e`, color: r.color, border: `1px solid ${r.color}55` }}
                >
                  {r.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate" style={{ color: "#F8FAFC" }}>{r.name}</span>
                    <span className="text-xs font-semibold shrink-0 ml-2" style={{ color: "#94A3B8" }}>{r.minutos} min</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <div className="h-full rounded-full" style={{ width: `${(r.minutos / rankingData[0].minutos) * 100}%`, background: r.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

function FinalCTA() {
  const bullets = [
    { icon: Target, text: "Dashboard completo de progresso" },
    { icon: Flame, text: "Ofensiva e gamificação diária" },
    { icon: Trophy, text: "Ranking com seus amigos" },
    { icon: Clock, text: "Relógio biológico de foco" },
    { icon: BookOpen, text: "Gestão de matérias por cor" },
    { icon: Users, text: "Heatmap anual de estudo" },
  ];
  return (
    <section id="precos" className="px-6 py-8">
      <div
        className="mx-auto max-w-7xl rounded-[2.5rem] px-8 py-16 md:px-16 md:py-20 relative overflow-hidden"
        style={{ background: "linear-gradient(120deg,#6D28D9 0%,#7C3AED 45%,#059669 100%)" }}
      >
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }} />
        <div className="relative grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.14)" }}>
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-semibold text-white tracking-wide">Comece em 40 segundos</span>
            </div>
            <h2 className="font-extrabold text-4xl md:text-5xl text-white leading-tight tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Seu próximo ano começa com um clique.
            </h2>
            <div className="mt-9 flex flex-wrap gap-4">
              <button className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-[15px] bg-white hover:scale-[1.03] transition-transform" style={{ color: "#6D28D9" }}>
                Criar conta grátis <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-4 text-xs text-white/70">Grátis para sempre · sem cartão de crédito</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-2.5 p-3.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.16)" }}>
                <b.icon className="w-4 h-4 text-white shrink-0" />
                <span className="text-xs font-medium text-white leading-snug">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-6 py-10">
      <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4 text-xs" style={{ color: "#5B6272" }}>
        <div className="flex items-center gap-2">
          <FlaskConical className="w-3.5 h-3.5" style={{ color: "#8B5CF6" }} />
          <span>StudiLab © 2026 — feito para quem estuda de verdade.</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacidade</a>
          <a href="#" className="hover:text-white transition-colors">Termos</a>
          <a href="#" className="hover:text-white transition-colors">Contato</a>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* ROOT                                                                 */
/* ------------------------------------------------------------------ */

export default function StudiLabLandingPage() {
  return (
    <div className="min-h-screen w-full relative" style={{ background: "#0A0A14" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');
        * { font-family: 'Inter', sans-serif; }
        @keyframes float { 0%,100% { transform: translateY(0px);} 50% { transform: translateY(-10px);} }
        @keyframes flicker { 0%,100% { transform: scale(1) rotate(0deg); opacity:1; } 50% { transform: scale(1.06) rotate(-2deg); opacity:0.92; } }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
        a:focus-visible, button:focus-visible { outline: 2px solid #A78BFA; outline-offset: 2px; }
      `}</style>

      {/* blueprint grid backdrop */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,92,246,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.7) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="relative">
        <Nav />
        <Hero />
        <SocialProof />
        <Features />
        <Gamification />
        <FinalCTA />
        <Footer />
      </div>
    </div>
  );
}
