"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell,
} from "recharts";
import {
  LayoutDashboard, Timer, Library, Play, Pause, RotateCcw, Brain, Flame,
  Sparkles, Clock, TrendingUp, Moon, Sunrise, Sun, ChevronRight, Target,
  Zap, Hourglass, CheckCircle2, Lock, BookOpen, Activity, Maximize2,
  Minimize2, PenLine, Trophy, ArrowRight, CircleDot,
} from "lucide-react";

/* ============================================================
   ESTÚDIO DE APRENDIZADO — protótipo interativo
   Conceito: "Observatório da Mente". Base escura profunda onde
   cada matéria é um "reino" com cor própria (Canto de Estudo).
   Números em fonte de telemetria (mono) = identidade visual.
   ============================================================ */

/* ---------- Tokens ---------- */
const BG = "#0A0D14";
const SURFACE = "rgba(255,255,255,0.045)";
const SURFACE_2 = "rgba(255,255,255,0.07)";
const STROKE = "rgba(255,255,255,0.09)";
const TXT = "#E9ECF2";
const MUTE = "#8C94A6";
const FAINT = "#5B6376";

const hexToRgba = (hex, a) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};

/* ---------- Dados base (matérias + árvore de tópicos) ---------- */
const SUBJECTS = [
  { id: "s1", name: "Direito Constitucional", color: "#E0A82E", realm: "Aurora" },
  { id: "s2", name: "Raciocínio Lógico", color: "#39C6F0", realm: "Cristal" },
  { id: "s3", name: "Língua Portuguesa", color: "#F472B6", realm: "Verbo" },
  { id: "s4", name: "Informática", color: "#34D399", realm: "Circuito" },
  { id: "s5", name: "Administração Pública", color: "#A78BFA", realm: "Ágora" },
];

const TOPIC_TREE = {
  s1: [
    {
      id: "t1", name: "Princípios Fundamentais", children: [
        { id: "t1a", name: "Fundamentos da República" },
        { id: "t1b", name: "Separação dos Poderes" },
      ]
    },
    {
      id: "t2", name: "Direitos e Garantias", children: [
        { id: "t2a", name: "Direitos Individuais" },
        { id: "t2b", name: "Direitos Sociais" },
        { id: "t2c", name: "Nacionalidade" },
      ]
    },
    {
      id: "t3", name: "Organização do Estado", children: [
        { id: "t3a", name: "União e Estados" },
        { id: "t3b", name: "Municípios" },
      ]
    },
  ],
  s2: [
    {
      id: "t4", name: "Lógica Proposicional", children: [
        { id: "t4a", name: "Conectivos" },
        { id: "t4b", name: "Tabela-Verdade" },
      ]
    },
    {
      id: "t5", name: "Análise Combinatória", children: [
        { id: "t5a", name: "Permutações" },
        { id: "t5b", name: "Probabilidade" },
      ]
    },
  ],
  s3: [
    {
      id: "t6", name: "Sintaxe", children: [
        { id: "t6a", name: "Concordância" },
        { id: "t6b", name: "Regência" },
      ]
    },
    {
      id: "t7", name: "Interpretação", children: [
        { id: "t7a", name: "Coesão e Coerência" },
      ]
    },
  ],
  s4: [
    {
      id: "t8", name: "Redes", children: [
        { id: "t8a", name: "Protocolos" },
        { id: "t8b", name: "Segurança" },
      ]
    },
    {
      id: "t9", name: "Pacote Office", children: [
        { id: "t9a", name: "Planilhas" },
      ]
    },
  ],
  s5: [
    {
      id: "t10", name: "Gestão de Pessoas", children: [
        { id: "t10a", name: "Liderança" },
        { id: "t10b", name: "Motivação" },
      ]
    },
    {
      id: "t11", name: "Processos", children: [
        { id: "t11a", name: "BPM" },
      ]
    },
  ],
};

/* flatten leaf topics per subject (folhas = unidades estudáveis) */
const leafTopics = (subjectId) => {
  const out = [];
  (TOPIC_TREE[subjectId] || []).forEach((p) =>
    (p.children || []).forEach((c) => out.push({ ...c, subjectId, parentId: p.id }))
  );
  return out;
};

/* ---------- Gerador determinístico de StudyLogs ---------- */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const DAY = 86400000;

function buildLogs() {
  const rnd = mulberry32(20260614);
  const logs = [];
  const now = Date.now();
  let lid = 0;
  // pesos por matéria (Direito é o foco; Admin será negligenciada no fim)
  const weight = { s1: 0.95, s2: 0.7, s3: 0.6, s4: 0.5, s5: 0.55 };
  for (let d = 69; d >= 0; d--) {
    const dayStart = now - d * DAY;
    SUBJECTS.forEach((s) => {
      // Admin não é estudada nos últimos 11 dias -> dispara "Revisão"
      if (s.id === "s5" && d < 11) return;
      if (rnd() > weight[s.id]) return;
      const sessions = rnd() > 0.7 ? 2 : 1;
      for (let k = 0; k < sessions; k++) {
        // Direito tende à manhã (9h); outras espalhadas; estudo noturno comum
        let hour;
        if (s.id === "s1") hour = 8 + Math.floor(rnd() * 3);
        else hour = rnd() > 0.45 ? 19 + Math.floor(rnd() * 4) : 13 + Math.floor(rnd() * 5);
        const start = dayStart - (dayStart % DAY) + (hour * 3600000) + Math.floor(rnd() * 1800000);
        const dur = 25 + Math.floor(rnd() * 70); // minutos
        const leaves = leafTopics(s.id);
        const topic = leaves[Math.floor(rnd() * leaves.length)];
        logs.push({
          id: "l" + lid++,
          start_time: new Date(start),
          end_time: new Date(start + dur * 60000),
          notes: null,
          topicId: topic.id,
          subjectId: s.id,
          duration: dur,
        });
      }
    });
  }
  return logs;
}

/* ---------- Cálculos derivados ---------- */
const levelFromHours = (h) => Math.max(1, Math.floor(Math.sqrt(h * 4)));
const hoursForLevel = (lvl) => (lvl * lvl) / 4;

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MESES_LONG = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const fmtDate = (d) => `${d.getDate()} de ${MESES_LONG[d.getMonth()]}`;

function computeSubjectStats(logs, subject) {
  const mine = logs.filter((l) => l.subjectId === subject.id);
  const totalMin = mine.reduce((a, l) => a + l.duration, 0);
  const totalHours = totalMin / 60;
  const level = levelFromHours(totalHours);
  const into = totalHours - hoursForLevel(level);
  const span = hoursForLevel(level + 1) - hoursForLevel(level);
  const levelProgress = Math.max(0, Math.min(1, into / span));

  const lastStudied = mine.length
    ? new Date(Math.max(...mine.map((l) => +new Date(l.end_time))))
    : null;
  const daysSince = lastStudied ? Math.floor((Date.now() - +lastStudied) / DAY) : 999;
  const needsReview = daysSince >= 7;

  // tópicos conquistados (folhas com qualquer log)
  const conqueredSet = new Set(mine.map((l) => l.topicId));
  const leaves = leafTopics(subject.id);
  const conquered = leaves.filter((t) => conqueredSet.has(t.id)).length;
  const totalTopics = leaves.length;

  // ritmo -> estimativa de conclusão
  const remaining = totalTopics - conquered;
  const perDay = conquered / 70;
  let eta = null;
  if (remaining > 0 && perDay > 0.001) {
    eta = new Date(Date.now() + Math.min(220, remaining / perDay) * DAY);
  }

  // produtividade por período do dia
  const buckets = { manhã: 0, tarde: 0, noite: 0 };
  mine.forEach((l) => {
    const h = new Date(l.start_time).getHours();
    if (h < 12) buckets.manhã += l.duration;
    else if (h < 18) buckets.tarde += l.duration;
    else buckets.noite += l.duration;
  });
  const best = Object.entries(buckets).sort((a, b) => b[1] - a[1])[0];
  const avg = (buckets.manhã + buckets.tarde + buckets.noite) / 3 || 1;
  const uplift = best ? Math.round(((best[1] - avg) / avg) * 100) : 0;

  // heatmap 49 dias
  const map = {};
  mine.forEach((l) => {
    const key = new Date(new Date(l.start_time).toDateString()).getTime();
    map[key] = (map[key] || 0) + l.duration;
  });

  return {
    subject, totalMin, totalHours, level, levelProgress, lastStudied, daysSince,
    needsReview, conquered, totalTopics, eta, bestPeriod: best ? best[0] : "noite",
    uplift, heat: map, conqueredSet,
  };
}

function weeklySeries(logs) {
  const out = [];
  for (let d = 6; d >= 0; d--) {
    const day = new Date(new Date(Date.now() - d * DAY).toDateString());
    const key = +day;
    let min = 0;
    logs.forEach((l) => {
      if (+new Date(new Date(l.start_time).toDateString()) === key) min += l.duration;
    });
    const dn = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"][day.getDay()];
    out.push({ label: dn, h: +(min / 60).toFixed(1), min });
  }
  return out;
}

function streak(logs) {
  const days = new Set(logs.map((l) => +new Date(new Date(l.start_time).toDateString())));
  let s = 0;
  for (let d = 0; d < 120; d++) {
    const key = +new Date(new Date(Date.now() - d * DAY).toDateString());
    if (days.has(key)) s++;
    else if (d === 0) continue; // hoje pode não ter ainda
    else break;
  }
  return s;
}

function bioSync(logs, hour) {
  const score = {};
  logs.forEach((l) => {
    const h = new Date(l.start_time).getHours();
    if (Math.abs(h - hour) <= 1) score[l.subjectId] = (score[l.subjectId] || 0) + l.duration;
  });
  const ranked = SUBJECTS.map((s) => ({ s, v: score[s.id] || 0 })).sort((a, b) => b.v - a.v);
  return ranked.filter((r) => r.v > 0).slice(0, 2).map((r) => r.s);
}

const periodIcon = (p) => (p === "manhã" ? Sunrise : p === "tarde" ? Sun : Moon);

/* ============================================================
   PRIMITIVAS DE UI
   ============================================================ */
function Glass({ style, className = "", children, accent, hover }) {
  return (
    <div
      className={"relative rounded-2xl " + className}
      style={{
        background: SURFACE,
        border: `1px solid ${accent ? hexToRgba(accent, 0.28) : STROKE}`,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: accent
          ? `0 1px 0 rgba(255,255,255,0.05) inset, 0 10px 40px -18px ${hexToRgba(accent, 0.5)}`
          : "0 1px 0 rgba(255,255,255,0.05) inset",
        transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease",
        ...(hover ? {} : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Ring({ size = 220, stroke = 14, progress = 0, color = "#39C6F0", pulse, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(1, progress)));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ display: "block", transform: "rotate(-90deg)" }}>
        {/* Background circle */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        {/* Foreground circle */}
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset .6s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 10px ${hexToRgba(color, 0.6)})` }}
        />
      </svg>
      {pulse && (
        <div className="ea-pulse" style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          boxShadow: `0 0 0 0 ${hexToRgba(color, 0.45)}`,
        }} />
      )}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}

function MiniHeat({ heat, color, weeks = 7 }) {
  const cells = [];
  const today = new Date(new Date().toDateString());
  let max = 1;
  Object.values(heat).forEach((v) => (max = Math.max(max, v)));
  for (let w = weeks - 1; w >= 0; w--) {
    const col = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(+today - (w * 7 + d) * DAY);
      const v = heat[+new Date(date.toDateString())] || 0;
      const a = v ? 0.18 + 0.82 * (v / max) : 0;
      col.push(
        <div key={w + "-" + d} title={`${date.getDate()}/${date.getMonth() + 1} · ${v}min`}
          style={{
            width: 10, height: 10, borderRadius: 2,
            background: v ? hexToRgba(color, a) : "rgba(255,255,255,0.05)",
          }} />
      );
    }
    cells.push(<div key={w} style={{ display: "flex", flexDirection: "column", gap: 3 }}>{col}</div>);
  }
  return <div style={{ display: "flex", gap: 3 }}>{cells}</div>;
}

/* ============================================================
   SHELL / NAVEGAÇÃO
   ============================================================ */
const NAV = [
  { id: "dashboard", label: "Painel", icon: LayoutDashboard },
  { id: "sessao", label: "Nova Sessão", icon: Timer },
  { id: "atlas", label: "Atlas", icon: Library },
];

export default function App() {
  const [logsExtra, setLogsExtra] = useState([]);
  const baseLogs = useMemo(() => buildLogs(), []);
  const logs = useMemo(() => [...baseLogs, ...logsExtra], [baseLogs, logsExtra]);

  const [view, setView] = useState("dashboard");
  const [activeSubject, setActiveSubject] = useState(SUBJECTS[0]);
  const [zen, setZen] = useState(false);

  const stats = useMemo(
    () => SUBJECTS.map((s) => computeSubjectStats(logs, s)),
    [logs]
  );

  const addLog = useCallback((log) => setLogsExtra((p) => [...p, log]), []);

  // tema ambiente dirigido pela matéria ativa (somente na sessão)
  const ambient = view === "sessao" ? activeSubject.color : "#6E7CF0";

  return (
    <div style={{ minHeight: 560, background: BG, color: TXT, fontFamily: "var(--ea-sans)", position: "relative", overflow: "hidden", borderRadius: 18 }}>
      <StyleTag />
      {/* clima de fundo */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(900px 500px at 78% -8%, ${hexToRgba(ambient, 0.18)}, transparent 60%), radial-gradient(700px 500px at 0% 110%, ${hexToRgba(ambient, 0.1)}, transparent 55%)`,
        transition: "background .8s ease",
      }} />

      <div style={{ position: "relative", display: "flex", minHeight: 560 }}>
        {/* RAIL */}
        <aside style={{
          width: zen ? 0 : 76, flexShrink: 0, transition: "width .4s cubic-bezier(.4,0,.2,1)",
          overflow: "hidden", borderRight: `1px solid ${STROKE}`,
          display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 18, gap: 6,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", marginBottom: 14,
            background: hexToRgba(ambient, 0.16), border: `1px solid ${hexToRgba(ambient, 0.4)}`
          }}>
            <Brain size={20} color={ambient} />
          </div>
          {NAV.map((n) => {
            const on = view === n.id;
            const Ico = n.icon;
            return (
              <button key={n.id} onClick={() => setView(n.id)} title={n.label}
                style={{
                  width: 48, height: 48, borderRadius: 13, display: "grid", placeItems: "center",
                  background: on ? hexToRgba(ambient, 0.16) : "transparent",
                  border: on ? `1px solid ${hexToRgba(ambient, 0.4)}` : "1px solid transparent",
                  color: on ? ambient : MUTE, cursor: "pointer", transition: "all .2s",
                }}>
                <Ico size={20} />
              </button>
            );
          })}
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, minWidth: 0, padding: zen ? "20px 26px" : "20px 30px" }}>
          <TopBar logs={logs} stats={stats} zen={zen} onZen={() => setZen((z) => !z)} view={view} />
          <div key={view} className="ea-view">
            {view === "dashboard" && (
              <Dashboard logs={logs} stats={stats}
                go={(v, s) => { if (s) setActiveSubject(s); setView(v); }} />
            )}
            {view === "sessao" && (
              <Session logs={logs} subject={activeSubject} setSubject={setActiveSubject}
                stats={stats} zen={zen} setZen={setZen} onComplete={addLog} />
            )}
            {view === "atlas" && (
              <Atlas stats={stats} go={(s) => { setActiveSubject(s); setView("sessao"); }} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function TopBar({ logs, stats, zen, onZen, view }) {
  const str = useMemo(() => streak(logs), [logs]);
  const todayMin = useMemo(() => {
    const key = +new Date(new Date().toDateString());
    return logs.filter((l) => +new Date(new Date(l.start_time).toDateString()) === key)
      .reduce((a, l) => a + l.duration, 0);
  }, [logs]);
  const reviews = stats.filter((s) => s.needsReview).length;
  const titleMap = { dashboard: "Painel de Comando", sessao: "Motor de Deep Work", atlas: "Atlas de Maestria" };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: 2, color: FAINT, fontFamily: "var(--ea-mono)", textTransform: "uppercase" }}>
          Estúdio de Aprendizado
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.3 }}>{titleMap[view]}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Pill icon={Flame} color="#FF7A45" label={`${str} dias`} />
        <Pill icon={Clock} color="#39C6F0" label={`${Math.floor(todayMin / 60)}h ${todayMin % 60}m hoje`} />
        {reviews > 0 && <Pill icon={Hourglass} color="#F472B6" label={`${reviews} p/ revisar`} />}
        <button onClick={onZen} title="Modo Zen" style={{
          width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center",
          background: SURFACE, border: `1px solid ${STROKE}`, color: MUTE, cursor: "pointer",
        }}>
          {zen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
        </button>
      </div>
    </div>
  );
}

function Pill({ icon: Ico, color, label }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 11,
      background: SURFACE, border: `1px solid ${STROKE}`, fontSize: 13,
    }}>
      <Ico size={14} color={color} />
      <span style={{ fontFamily: "var(--ea-mono)", color: TXT }}>{label}</span>
    </div>
  );
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function Dashboard({ logs, stats, go }) {
  const week = useMemo(() => weeklySeries(logs), [logs]);
  const totalH = stats.reduce((a, s) => a + s.totalHours, 0);
  const reviews = stats.filter((s) => s.needsReview);
  const topSubject = [...stats].sort((a, b) => b.totalHours - a.totalHours)[0];

  const bySubject = stats.map((s) => ({
    name: s.subject.name.split(" ")[0], h: +s.totalHours.toFixed(1), color: s.subject.color,
  })).sort((a, b) => b.h - a.h);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
      {/* coluna principal */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* decisões rápidas */}
        <Glass style={{ padding: 18 }}>
          <Label icon={Zap}>Tomada de decisão rápida</Label>
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <Decision color={topSubject.subject.color} onClick={() => go("sessao", topSubject.subject)}
              title={`Continuar ${topSubject.subject.name.split(" ")[0]}`} sub="retomar foco" icon={Play} />
            <Decision color="#F472B6" onClick={() => go("atlas")}
              title={`Revisar pendências`} sub={`${reviews.length} matérias`} icon={Hourglass} />
            <Decision color="#34D399" onClick={() => go("atlas")}
              title="Explorar Atlas" sub="mapa de maestria" icon={Library} />
          </div>
        </Glass>

        {/* gráfico semanal */}
        <Glass style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <Label icon={Activity}>Constância · últimos 7 dias</Label>
            <div style={{ fontFamily: "var(--ea-mono)", fontSize: 13, color: MUTE }}>
              {week.reduce((a, d) => a + d.h, 0).toFixed(1)}h
            </div>
          </div>
          <div style={{ height: 190, marginTop: 14, marginLeft: -16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={week}>
                <defs>
                  <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6E7CF0" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#6E7CF0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: MUTE, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: MUTE, fontSize: 12 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<ChartTip />} cursor={{ stroke: "rgba(255,255,255,0.15)" }} />
                <Area type="monotone" dataKey="h" stroke="#8B97FF" strokeWidth={2.5} fill="url(#gA)"
                  dot={{ r: 3, fill: "#8B97FF" }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Glass>

        {/* horas por matéria */}
        <Glass style={{ padding: 18 }}>
          <Label icon={TrendingUp}>Distribuição por matéria</Label>
          <div style={{ height: 150, marginTop: 12, marginLeft: -16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bySubject} layout="vertical" barCategoryGap={10}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fill: MUTE, fontSize: 12 }}
                  axisLine={false} tickLine={false} width={84} />
                <Tooltip content={<ChartTip unit="h" />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="h" radius={[0, 6, 6, 0]}>
                  {bySubject.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Glass>
      </div>

      {/* coluna lateral */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Glass style={{ padding: 18 }} accent="#6E7CF0">
          <Label icon={Target}>Síntese</Label>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 10 }}>
            <span style={{ fontFamily: "var(--ea-mono)", fontSize: 38, fontWeight: 600, color: TXT }}>
              {totalH.toFixed(0)}
            </span>
            <span style={{ color: MUTE, fontSize: 13 }}>horas acumuladas</span>
          </div>
          <div style={{ height: 1, background: STROKE, margin: "14px 0" }} />
          <Row k="Matéria favorita" v={topSubject.subject.name.split(" ")[0]} c={topSubject.subject.color} />
          <Row k="Maior nível" v={"Nv. " + Math.max(...stats.map((s) => s.level))} />
          <Row k="Pendentes de revisão" v={reviews.length + ""} c={reviews.length ? "#F472B6" : MUTE} />
        </Glass>

        <Glass style={{ padding: 18 }}>
          <Label icon={Sparkles}>Insights de IA</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            <Insight color={topSubject.subject.color}
              text={`Você rende ${Math.max(8, topSubject.uplift)}% mais estudando ${topSubject.subject.name.split(" ")[0]} à ${topSubject.bestPeriod}.`} />
            {reviews[0] && (
              <Insight color="#F472B6"
                text={`${reviews[0].subject.name} está há ${reviews[0].daysSince} dias sem revisão — a curva do esquecimento está agindo.`} />
            )}
            {topSubject.eta && (
              <Insight color="#34D399"
                text={`Neste ritmo, você conclui ${topSubject.subject.name.split(" ")[0]} em ${fmtDate(topSubject.eta)}.`} />
            )}
          </div>
        </Glass>
      </div>
    </div>
  );
}

function Decision({ color, title, sub, icon: Ico, onClick }) {
  return (
    <button onClick={onClick} className="ea-lift" style={{
      flex: 1, minWidth: 150, textAlign: "left", cursor: "pointer", padding: 14, borderRadius: 14,
      background: hexToRgba(color, 0.1), border: `1px solid ${hexToRgba(color, 0.32)}`, color: TXT,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: hexToRgba(color, 0.18), display: "grid", placeItems: "center" }}>
          <Ico size={16} color={color} />
        </div>
        <ArrowRight size={15} color={color} style={{ marginLeft: "auto" }} />
      </div>
      <div style={{ fontWeight: 600, fontSize: 14, marginTop: 10 }}>{title}</div>
      <div style={{ fontSize: 12, color: MUTE }}>{sub}</div>
    </button>
  );
}

function Insight({ color, text }) {
  return (
    <div style={{ display: "flex", gap: 9, padding: 11, borderRadius: 11, background: hexToRgba(color, 0.07), border: `1px solid ${hexToRgba(color, 0.2)}` }}>
      <Sparkles size={15} color={color} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 12.5, lineHeight: 1.45, color: "#D6DAE3" }}>{text}</span>
    </div>
  );
}

function Row({ k, v, c }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", fontSize: 13 }}>
      <span style={{ color: MUTE }}>{k}</span>
      <span style={{ fontFamily: "var(--ea-mono)", color: c || TXT, fontWeight: 600 }}>{v}</span>
    </div>
  );
}

/* ============================================================
   SESSÃO — Motor de Deep Work
   ============================================================ */
const GOALS = [25, 50, 90];
const INSIGHT_POOL = [
  "Você já está no seu 3º bloco produtivo de hoje! 🔥",
  "Respiração estável. Mantenha o ritmo do parágrafo atual.",
  "Bloco de ouro: sua retenção é maior nos primeiros 20 min.",
  "Anote a dúvida no diário — não pare o fluxo agora.",
];

function Session({ logs, subject, setSubject, stats, zen, setZen, onComplete }) {
  const hour = new Date().getHours();
  const suggestions = useMemo(() => bioSync(logs, hour), [logs, hour]);
  const [goal, setGoal] = useState(50);
  const [elapsed, setElapsed] = useState(0); // segundos
  const [running, setRunning] = useState(false);
  const [notes, setNotes] = useState("");
  const [insight, setInsight] = useState(null);
  const [topic, setTopic] = useState(leafTopics(subject.id)[0]);
  const startedAt = useRef(null);

  useEffect(() => { setTopic(leafTopics(subject.id)[0]); }, [subject]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  // insights flutuantes em foco
  useEffect(() => {
    if (!running) { setInsight(null); return; }
    const show = () => {
      setInsight(INSIGHT_POOL[Math.floor(Math.random() * INSIGHT_POOL.length)]);
      setTimeout(() => setInsight(null), 5200);
    };
    const t = setInterval(show, 9000);
    const first = setTimeout(show, 2500);
    return () => { clearInterval(t); clearTimeout(first); };
  }, [running]);

  const goalSec = goal * 60;
  const progress = Math.min(1, elapsed / goalSec);
  const color = subject.color;

  const start = () => {
    if (!running && elapsed === 0) startedAt.current = Date.now();
    setRunning(true);
    if (!zen) setZen(true);
  };
  const pause = () => setRunning(false);
  const reset = () => { setRunning(false); setElapsed(0); setZen(false); };
  const finish = () => {
    const mins = Math.round(elapsed / 60);
    if (mins >= 1) {
      onComplete({
        id: "live" + Date.now(), subjectId: subject.id, topicId: topic.id,
        start_time: new Date(startedAt.current || Date.now() - elapsed * 1000),
        end_time: new Date(), duration: mins, notes: notes || null,
      });
    }
    reset(); setNotes("");
  };

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div style={{ display: "grid", gridTemplateColumns: zen ? "1fr" : "1fr 320px", gap: 18, transition: "all .4s" }}>
      {/* palco do cronômetro */}
      <Glass accent={color} style={{ padding: 26, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
        {/* contexto da sessão */}
        <div style={{ position: "absolute", top: 18, left: 20, display: "flex", alignItems: "center", gap: 9 }}>
          <CircleDot size={14} color={color} />
          <span style={{ fontSize: 13, color: MUTE }}>Canto: <b style={{ color: TXT }}>{subject.realm}</b></span>
        </div>
        <div style={{ position: "absolute", top: 16, right: 18, display: "flex", gap: 6 }}>
          {GOALS.map((g) => (
            <button key={g} onClick={() => !running && setGoal(g)} disabled={running}
              style={{
                fontSize: 12, padding: "5px 10px", borderRadius: 9, fontFamily: "var(--ea-mono)",
                cursor: running ? "default" : "pointer", color: goal === g ? color : MUTE,
                background: goal === g ? hexToRgba(color, 0.14) : "transparent",
                border: `1px solid ${goal === g ? hexToRgba(color, 0.4) : STROKE}`,
                opacity: running && goal !== g ? 0.4 : 1,
              }}>{g}m</button>
          ))}
        </div>

        <div style={{ height: 30 }} />
        <Ring size={236} stroke={15} progress={progress} color={color} pulse={running}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: MUTE, textTransform: "uppercase", fontFamily: "var(--ea-mono)" }}>
            {running ? "Em foco" : elapsed ? "Pausado" : "Pronto"}
          </div>
          <div style={{ fontFamily: "var(--ea-mono)", fontSize: 52, fontWeight: 600, lineHeight: 1.05, letterSpacing: 1 }}>
            {mm}:{ss}
          </div>
          <div style={{ fontSize: 12.5, color: MUTE }}>meta {goal} min</div>
        </Ring>

        {/* tópico atual */}
        <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 11, background: hexToRgba(color, 0.1), border: `1px solid ${hexToRgba(color, 0.3)}` }}>
          <BookOpen size={15} color={color} />
          <span style={{ fontSize: 13.5 }}>{subject.name.split(" ")[0]} · <b>{topic?.name}</b></span>
        </div>

        {/* controles */}
        <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
          {!running ? (
            <CtrlBtn primary color={color} onClick={start}><Play size={18} /> {elapsed ? "Retomar" : "Iniciar foco"}</CtrlBtn>
          ) : (
            <CtrlBtn color={color} onClick={pause}><Pause size={18} /> Pausar</CtrlBtn>
          )}
          <CtrlBtn onClick={reset}><RotateCcw size={17} /></CtrlBtn>
          {elapsed > 0 && <CtrlBtn color="#34D399" onClick={finish}><CheckCircle2 size={17} /> Concluir</CtrlBtn>}
        </div>

        {/* insight flutuante */}
        {insight && (
          <div className="ea-float" style={{
            position: "absolute", bottom: 22, padding: "10px 14px", borderRadius: 12, maxWidth: 360,
            background: hexToRgba(color, 0.16), border: `1px solid ${hexToRgba(color, 0.4)}`,
            backdropFilter: "blur(8px)", fontSize: 13, display: "flex", gap: 8, alignItems: "center",
          }}>
            <Sparkles size={15} color={color} /> {insight}
          </div>
        )}
      </Glass>

      {/* painel lateral (some no Zen) */}
      {!zen && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* início inteligente */}
          <Glass style={{ padding: 16 }}>
            <Label icon={Sunrise}>Início inteligente · {hour}h</Label>
            <div style={{ fontSize: 12, color: FAINT, marginTop: 2, marginBottom: 10 }}>baseado no seu relógio biológico</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(suggestions.length ? suggestions : SUBJECTS.slice(0, 2)).map((s, i) => (
                <button key={s.id} onClick={() => setSubject(s)} className="ea-lift" style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 11, cursor: "pointer",
                  textAlign: "left", color: TXT,
                  background: subject.id === s.id ? hexToRgba(s.color, 0.14) : SURFACE,
                  border: `1px solid ${i === 0 ? hexToRgba(s.color, 0.45) : STROKE}`,
                  boxShadow: i === 0 ? `0 0 22px -8px ${hexToRgba(s.color, 0.7)}` : "none",
                }}>
                  <span style={{ width: 9, height: 9, borderRadius: 9, background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, fontWeight: 500 }}>{s.name}</span>
                  {i === 0 && <span style={{ marginLeft: "auto", fontSize: 10.5, fontFamily: "var(--ea-mono)", color: s.color, padding: "2px 7px", borderRadius: 7, background: hexToRgba(s.color, 0.16) }}>USUAL</span>}
                </button>
              ))}
            </div>
            <div style={{ height: 1, background: STROKE, margin: "12px 0" }} />
            <div style={{ fontSize: 11, color: FAINT, marginBottom: 8 }}>Trocar matéria</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SUBJECTS.map((s) => (
                <button key={s.id} onClick={() => setSubject(s)} title={s.name} style={{
                  width: 26, height: 26, borderRadius: 8, cursor: "pointer",
                  background: hexToRgba(s.color, subject.id === s.id ? 0.9 : 0.25),
                  border: `1px solid ${hexToRgba(s.color, 0.5)}`,
                }} />
              ))}
            </div>
          </Glass>

          {/* tópico */}
          <Glass style={{ padding: 16 }}>
            <Label icon={Target}>Tópico em foco</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10, maxHeight: 120, overflowY: "auto" }}>
              {leafTopics(subject.id).map((t) => (
                <button key={t.id} onClick={() => setTopic(t)} style={{
                  textAlign: "left", padding: "7px 10px", borderRadius: 9, cursor: "pointer", fontSize: 13,
                  color: topic?.id === t.id ? TXT : MUTE,
                  background: topic?.id === t.id ? hexToRgba(color, 0.12) : "transparent",
                  border: `1px solid ${topic?.id === t.id ? hexToRgba(color, 0.3) : "transparent"}`,
                }}>{t.name}</button>
              ))}
            </div>
          </Glass>

          {/* diário de bordo */}
          <Glass style={{ padding: 16 }}>
            <Label icon={PenLine}>Diário de bordo</Label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Registre um insight sem pausar o fluxo…"
              style={{
                width: "100%", marginTop: 10, minHeight: 90, resize: "vertical", borderRadius: 11,
                background: "rgba(0,0,0,0.25)", border: `1px solid ${STROKE}`, color: TXT,
                padding: 11, fontSize: 13, fontFamily: "var(--ea-sans)", lineHeight: 1.5, outline: "none",
              }} />
          </Glass>
        </div>
      )}
    </div>
  );
}

function CtrlBtn({ children, primary, color, onClick }) {
  return (
    <button onClick={onClick} className="ea-lift" style={{
      display: "flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 13, cursor: "pointer",
      fontSize: 14, fontWeight: 600,
      color: primary ? "#0A0D14" : (color || TXT),
      background: primary ? color : (color ? hexToRgba(color, 0.12) : SURFACE),
      border: `1px solid ${color ? hexToRgba(color, primary ? 1 : 0.35) : STROKE}`,
      boxShadow: primary ? `0 8px 26px -10px ${hexToRgba(color, 0.9)}` : "none",
    }}>{children}</button>
  );
}

/* ============================================================
   ATLAS — Mapa de Maestria
   ============================================================ */
function Atlas({ stats, go }) {
  const [open, setOpen] = useState(stats[0].subject.id);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
      {stats.map((st) => (
        <MasteryCard key={st.subject.id} st={st} open={open === st.subject.id}
          onToggle={() => setOpen(open === st.subject.id ? null : st.subject.id)}
          go={() => go(st.subject)} />
      ))}
    </div>
  );
}

function MasteryCard({ st, open, onToggle, go }) {
  const { subject: s, color } = { subject: st.subject, color: st.subject.color };
  return (
    <Glass accent={color} className="ea-lift" style={{ padding: 18, display: "flex", flexDirection: "column" }}>
      {/* cabeçalho */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 13, flexShrink: 0, display: "grid", placeItems: "center",
          background: hexToRgba(color, 0.16), border: `1px solid ${hexToRgba(color, 0.4)}`
        }}>
          <span style={{ fontFamily: "var(--ea-mono)", fontWeight: 700, color, fontSize: 15 }}>
            {("Nv")}<span style={{ fontSize: 18 }}>{st.level}</span>
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</span>
            {st.needsReview && (
              <span title="Revisão necessária" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontFamily: "var(--ea-mono)", padding: "2px 7px", borderRadius: 7, color: "#F472B6", background: "rgba(244,114,182,0.14)", border: "1px solid rgba(244,114,182,0.35)" }}>
                <Hourglass size={11} /> REVISAR
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: MUTE, marginTop: 2 }}>
            Reino {s.realm} · {st.totalHours.toFixed(1)}h · {st.conquered}/{st.totalTopics} tópicos
          </div>
        </div>
      </div>

      {/* barra de nível */}
      <div style={{ marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: FAINT, marginBottom: 5, fontFamily: "var(--ea-mono)" }}>
          <span>Nv. {st.level}</span><span>Nv. {st.level + 1}</span>
        </div>
        <div style={{ height: 8, borderRadius: 6, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
          <div className="ea-fill" style={{
            width: `${st.levelProgress * 100}%`, height: "100%", borderRadius: 6,
            background: `linear-gradient(90deg, ${hexToRgba(color, 0.7)}, ${color})`,
            boxShadow: `0 0 12px ${hexToRgba(color, 0.7)}`,
          }} />
        </div>
      </div>

      {/* heatmap individual */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 11, color: FAINT, marginBottom: 7 }}>Constância (49 dias)</div>
        <MiniHeat heat={st.heat} color={color} />
      </div>

      {/* métricas de IA */}
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 7 }}>
        {st.eta && (
          <MiniMetric color="#34D399" icon={Clock} text={`Conclusão estimada: ${fmtDate(st.eta)}`} />
        )}
        <MiniMetric color={color} icon={periodIcon(st.bestPeriod)}
          text={`+${Math.max(8, st.uplift)}% de rendimento à ${st.bestPeriod}`} />
        {st.needsReview && (
          <MiniMetric color="#F472B6" icon={Hourglass} text={`${st.daysSince} dias desde a última revisão`} />
        )}
      </div>

      {/* árvore de conhecimento */}
      <button onClick={onToggle} style={{
        display: "flex", alignItems: "center", gap: 6, marginTop: 16, marginBottom: open ? 10 : 0,
        background: "transparent", border: "none", color: MUTE, cursor: "pointer", fontSize: 12.5, padding: 0,
      }}>
        <ChevronRight size={14} style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .25s" }} />
        Árvore de conhecimento
      </button>
      {open && <KnowledgeTree subjectId={s.id} color={color} conquered={st.conqueredSet} />}

      <button onClick={go} className="ea-lift" style={{
        marginTop: 16, padding: "10px 14px", borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: 13.5,
        color, background: hexToRgba(color, 0.1), border: `1px solid ${hexToRgba(color, 0.35)}`,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        Estudar agora <ArrowRight size={15} />
      </button>
    </Glass>
  );
}

function MiniMetric({ color, icon: Ico, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#C9CEDA" }}>
      <Ico size={14} color={color} style={{ flexShrink: 0 }} /> {text}
    </div>
  );
}

function KnowledgeTree({ subjectId, color, conquered }) {
  const tree = TOPIC_TREE[subjectId] || [];
  return (
    <div style={{ position: "relative", paddingLeft: 4 }}>
      {tree.map((p, pi) => {
        const kids = p.children || [];
        const doneKids = kids.filter((c) => conquered.has(c.id)).length;
        const branchDone = doneKids === kids.length;
        return (
          <div key={p.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                width: 11, height: 11, borderRadius: 11, flexShrink: 0,
                background: branchDone ? color : "rgba(255,255,255,0.15)",
                boxShadow: branchDone ? `0 0 10px ${hexToRgba(color, 0.8)}` : "none",
              }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: branchDone ? TXT : "#AEB4C2" }}>{p.name}</span>
              <span style={{ fontSize: 11, color: FAINT, fontFamily: "var(--ea-mono)" }}>{doneKids}/{kids.length}</span>
            </div>
            <div style={{ marginLeft: 5, borderLeft: `1px solid ${STROKE}`, paddingLeft: 14, marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
              {kids.map((c) => {
                const done = conquered.has(c.id);
                return (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {done
                      ? <CheckCircle2 size={14} color={color} className="ea-glow" style={{ filter: `drop-shadow(0 0 5px ${hexToRgba(color, 0.8)})` }} />
                      : <Lock size={13} color={FAINT} />}
                    <span style={{ fontSize: 12.5, color: done ? TXT : FAINT }}>{c.name}</span>
                    {done && <Trophy size={11} color={color} style={{ marginLeft: "auto", opacity: 0.8 }} />}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- compartilhados ---------- */
function Label({ icon: Ico, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, letterSpacing: 0.4, color: MUTE, textTransform: "uppercase", fontWeight: 600 }}>
      {Ico && <Ico size={14} />} {children}
    </div>
  );
}

function ChartTip({ active, payload, label, unit = "h" }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: "rgba(15,18,26,0.95)", border: `1px solid ${STROKE}`, borderRadius: 10, padding: "8px 11px", fontSize: 12.5, backdropFilter: "blur(8px)" }}>
      <div style={{ color: MUTE, marginBottom: 3 }}>{label}</div>
      <div style={{ fontFamily: "var(--ea-mono)", color: TXT, fontWeight: 600 }}>
        {payload[0].value} {unit}
      </div>
    </div>
  );
}

/* ---------- estilos globais / animações ---------- */
function StyleTag() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      :root{
        --ea-sans:'Space Grotesk',ui-sans-serif,system-ui,-apple-system,sans-serif;
        --ea-mono:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
      }
      *{box-sizing:border-box}
      ::-webkit-scrollbar{width:6px;height:6px}
      ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.14);border-radius:6px}
      textarea::placeholder{color:${FAINT}}
      .ea-view{animation:eaIn .45s cubic-bezier(.4,0,.2,1)}
      @keyframes eaIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      .ea-lift{transition:transform .2s ease, box-shadow .2s ease}
      .ea-lift:hover{transform:translateY(-2px)}
      .ea-pulse{animation:eaPulse 2s ease-out infinite}
      @keyframes eaPulse{0%{box-shadow:0 0 0 0 rgba(255,255,255,0.25)}70%{box-shadow:0 0 0 22px rgba(255,255,255,0)}100%{box-shadow:0 0 0 0 rgba(255,255,255,0)}}
      .ea-float{animation:eaFloat .5s cubic-bezier(.4,0,.2,1)}
      @keyframes eaFloat{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
      .ea-fill{transition:width .8s cubic-bezier(.4,0,.2,1)}
      .ea-glow{animation:eaGlow 2.4s ease-in-out infinite}
      @keyframes eaGlow{0%,100%{opacity:1}50%{opacity:.65}}
      @media (prefers-reduced-motion: reduce){
        *{animation:none!important;transition:none!important}
      }
    `}</style>
  );
}
