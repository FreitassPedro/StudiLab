"use client";
import { useState, useMemo } from "react";
import { LogType, TopicNode, VideoClassStatus, QuestionStatus, CCAStatus, ReviewStatus, StudyLog, INITIAL_NODES, INITIAL_LOGS, Subject, INITIAL_SUBJECTS } from "./mockData";


// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────
const VIDEO_STATUS_OPTIONS: VideoClassStatus[] = ["Pendente", "Assistida", "Pular"];
const QUESTION_STATUS_OPTIONS: QuestionStatus[] = ["Pendente", "Concluída"];
const CCA_OPTIONS: CCAStatus[] = ["Fraca", "Médio", "Confiante"];
const REVIEW_STATUS_OPTIONS: ReviewStatus[] = ["Não Iniciada", "Agendada", "Concluída"];
const LOG_TYPE_OPTIONS: LogType[] = ["estudo", "revisão", "questões", "pendência", "nota"];

const videoStatusColor = (s: VideoClassStatus) =>
  s === "Assistida" ? "bg-emerald-100 text-emerald-700 border-emerald-300" : s === "Pular" ? "bg-violet-100 text-violet-700 border-violet-300" : "bg-amber-50 text-amber-700 border-amber-300";
const questionStatusColor = (s: QuestionStatus) =>
  s === "Concluída" ? "bg-emerald-100 text-emerald-700 border-emerald-300" : "bg-amber-50 text-amber-700 border-amber-300";
const reviewStatusColor = (s: ReviewStatus) =>
  s === "Concluída" ? "bg-emerald-100 text-emerald-700 border-emerald-300" : s === "Agendada" ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-slate-100 text-slate-500 border-slate-300";
const ccaDot = (s: CCAStatus) =>
  s === "Fraca" ? "bg-red-500" : s === "Médio" ? "bg-amber-400" : "bg-emerald-500";
const ccaSelectColor = (s: CCAStatus) =>
  s === "Confiante" ? "bg-emerald-100 text-emerald-700 border-emerald-300" : s === "Médio" ? "bg-amber-100 text-amber-700 border-amber-300" : "bg-slate-100 text-slate-600 border-slate-300";
const logTypeColor = (t: LogType) =>
  t === "estudo" ? "bg-indigo-100 text-indigo-700" : t === "revisão" ? "bg-blue-100 text-blue-700" : t === "questões" ? "bg-emerald-100 text-emerald-700" : t === "pendência" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600";
const logTypeIcon = (t: LogType) =>
  t === "estudo" ? "📚" : t === "revisão" ? "🔄" : t === "questões" ? "✅" : t === "pendência" ? "⚠️" : "📝";
const performanceColor = (p: number) =>
  p === 0 ? "text-slate-400" : p >= 80 ? "text-emerald-600 font-semibold" : p >= 60 ? "text-amber-600 font-semibold" : "text-red-500 font-semibold";

const buildTree = (nodes: TopicNode[]) => {
  const map = new Map<string | null, TopicNode[]>();
  for (const n of nodes) { const l = map.get(n.parentId) ?? []; l.push(n); map.set(n.parentId, l); }
  return map;
};

const fmtDate = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
const fmtDateTime = (d: Date) => d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const uid = () => Math.random().toString(36).slice(2, 10);

// ────────────────────────────────────────────────────────────
// Generic Select
// ────────────────────────────────────────────────────────────
function Sel<T extends string>({ value, options, onChange, colorFn }: { value: T; options: T[]; onChange: (v: T) => void; colorFn: (v: T) => string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as T)}
      className={`text-xs px-2 py-0.5 rounded border cursor-pointer outline-none focus:ring-1 focus:ring-indigo-400 transition-colors ${colorFn(value)}`}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ────────────────────────────────────────────────────────────
// Performance Bar
// ────────────────────────────────────────────────────────────
function PerformanceBar({ value }: { value: number }) {
  if (value === 0) return <span className="text-slate-400 text-xs">—</span>;
  return (
    <div className="flex items-center gap-2">
      <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${value >= 80 ? "bg-emerald-500" : value >= 60 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`text-xs ${performanceColor(value)}`}>{value}%</span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Detail Panel — Logs, Pendências, Revisão
// ────────────────────────────────────────────────────────────
interface DetailPanelProps {
  node: TopicNode;
  logs: StudyLog[];
  onClose: () => void;
  onUpdateNode: (id: string, patch: Partial<TopicNode>) => void;
  onAddLog: (log: StudyLog) => void;
}

function DetailPanel({ node, logs, onClose, onUpdateNode, onAddLog }: DetailPanelProps) {
  const [tab, setTab] = useState<"logs" | "pendencias" | "revisao">("logs");
  const [logMsg, setLogMsg] = useState("");
  const [logType, setLogType] = useState<LogType>("estudo");
  const [logPerf, setLogPerf] = useState("");
  const [newPendency, setNewPendency] = useState("");

  const topicLogs = logs.filter((l) => l.topicId === node.id).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const pendencies = node.metadata.pendencies;
  const openCount = pendencies.filter((p) => !p.resolved).length;

  const addLog = () => {
    if (!logMsg.trim()) return;
    onAddLog({ id: uid(), topicId: node.id, nodeName: node.name, type: logType, message: logMsg.trim(), performance: logPerf ? parseInt(logPerf) : undefined, createdAt: new Date() });
    setLogMsg(""); setLogPerf("");
  };

  const addPendency = () => {
    if (!newPendency.trim()) return;
    const updated = [...pendencies, { id: uid(), text: newPendency.trim(), resolved: false, createdAt: new Date() }];
    onUpdateNode(node.id, { metadata: { ...node.metadata, pendencies: updated } });
    setNewPendency("");
  };

  const togglePendency = (pid: string) => {
    const updated = pendencies.map((p) => p.id === pid ? { ...p, resolved: !p.resolved } : p);
    onUpdateNode(node.id, { metadata: { ...node.metadata, pendencies: updated } });
  };

  const removePendency = (pid: string) => {
    onUpdateNode(node.id, { metadata: { ...node.metadata, pendencies: pendencies.filter((p) => p.id !== pid) } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-indigo-900 text-white px-5 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-indigo-300 uppercase tracking-widest mb-0.5">Detalhes do Tópico</p>
            <h2 className="font-bold text-base leading-tight truncate">{node.name}</h2>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${node.status === "Confiante" ? "bg-emerald-500/20 text-emerald-300" : node.status === "Médio" ? "bg-amber-400/20 text-amber-300" : "bg-red-500/20 text-red-300"}`}>{node.status}</span>
              {node.metrics.lastPerformance > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white">{node.metrics.lastPerformance}% desempenho</span>}
              {openCount > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-red-400/20 text-red-300">{openCount} pendência{openCount > 1 ? "s" : ""}</span>}
            </div>
          </div>
          <button onClick={onClose} className="text-indigo-300 hover:text-white transition-colors text-xl leading-none mt-0.5 flex-shrink-0">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          {(["logs", "pendencias", "revisao"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${tab === t ? "border-b-2 border-indigo-600 text-indigo-700 bg-white" : "text-slate-500 hover:text-slate-700"}`}>
              {t === "logs" ? `📋 Logs (${topicLogs.length})` : t === "pendencias" ? `⚠️ Pendências (${openCount})` : "🔄 Revisão"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">

          {/* ── LOGS ── */}
          {tab === "logs" && (
            <>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Novo Registro</p>
                <div className="flex gap-2 flex-wrap">
                  <select value={logType} onChange={(e) => setLogType(e.target.value as LogType)}
                    className={`text-xs px-2 py-1 rounded border outline-none focus:ring-1 focus:ring-indigo-400 ${logTypeColor(logType)}`}>
                    {LOG_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{logTypeIcon(o)} {o}</option>)}
                  </select>
                  <input type="number" min={0} max={100} placeholder="% acerto" value={logPerf} onChange={(e) => setLogPerf(e.target.value)}
                    className="w-24 text-xs px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white" />
                </div>
                <div className="flex gap-2">
                  <textarea value={logMsg} onChange={(e) => setLogMsg(e.target.value)} placeholder="Descreva o que foi feito..." rows={2}
                    onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) addLog(); }}
                    className="flex-1 text-xs px-2 py-1.5 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white" />
                  <button onClick={addLog} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors self-end">Salvar</button>
                </div>
              </div>

              {topicLogs.length === 0 && <p className="text-center text-slate-400 text-sm py-6">Nenhum log registrado ainda.</p>}

              {topicLogs.map((log) => (
                <div key={log.id} className="flex gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 transition-colors">
                  <span className="text-lg leading-none mt-0.5">{logTypeIcon(log.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${logTypeColor(log.type)}`}>{log.type}</span>
                      {log.performance !== undefined && <span className={`text-xs font-semibold ${performanceColor(log.performance)}`}>{log.performance}%</span>}
                      <span className="text-xs text-slate-400 ml-auto">{fmtDateTime(log.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-snug">{log.message}</p>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ── PENDÊNCIAS ── */}
          {tab === "pendencias" && (
            <>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Nova Pendência</p>
                <div className="flex gap-2">
                  <input value={newPendency} onChange={(e) => setNewPendency(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addPendency(); }}
                    placeholder="Descreva o que ficou pendente..."
                    className="flex-1 text-sm px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white" />
                  <button onClick={addPendency} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors">Adicionar</button>
                </div>
              </div>

              {pendencies.length === 0 && <p className="text-center text-slate-400 text-sm py-6">Nenhuma pendência. ✅</p>}

              {pendencies.filter((p) => !p.resolved).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Em aberto</p>
                  <div className="space-y-2">
                    {pendencies.filter((p) => !p.resolved).map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                        <button onClick={() => togglePendency(p.id)} className="w-5 h-5 rounded border-2 border-red-300 hover:border-red-500 transition-colors flex-shrink-0" />
                        <p className="flex-1 text-sm text-slate-700">{p.text}</p>
                        <span className="text-xs text-slate-400">{fmtDate(p.createdAt)}</span>
                        <button onClick={() => removePendency(p.id)} className="text-red-300 hover:text-red-500 transition-colors">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendencies.filter((p) => p.resolved).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">Resolvidas</p>
                  <div className="space-y-2">
                    {pendencies.filter((p) => p.resolved).map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg opacity-70">
                        <button onClick={() => togglePendency(p.id)} className="w-5 h-5 rounded border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs leading-none">✓</span>
                        </button>
                        <p className="flex-1 text-sm text-slate-500 line-through">{p.text}</p>
                        <span className="text-xs text-slate-400">{fmtDate(p.createdAt)}</span>
                        <button onClick={() => removePendency(p.id)} className="text-slate-300 hover:text-slate-500 transition-colors">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── REVISÃO ── */}
          {tab === "revisao" && (
            <>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Status da Revisão</p>
                  <Sel value={node.metadata.reviewStatus} options={REVIEW_STATUS_OPTIONS}
                    onChange={(v) => onUpdateNode(node.id, { metadata: { ...node.metadata, reviewStatus: v } })}
                    colorFn={reviewStatusColor} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Data de Revisão</p>
                  <input type="date" value={node.metadata.reviewDate ?? ""}
                    onChange={(e) => onUpdateNode(node.id, { metadata: { ...node.metadata, reviewDate: e.target.value } })}
                    className="text-sm px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Desempenho na Revisão</p>
                  <div className="flex items-center gap-3">
                    <input type="number" min={0} max={100} value={node.metrics.lastPerformance}
                      onChange={(e) => onUpdateNode(node.id, { metrics: { ...node.metrics, lastPerformance: Math.min(100, parseInt(e.target.value) || 0) } })}
                      className="w-20 text-sm text-center border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white" />
                    <PerformanceBar value={node.metrics.lastPerformance} />
                  </div>
                </div>
              </div>

              {logs.filter((l) => l.topicId === node.id && l.type === "revisão").length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Histórico de Revisões</p>
                  <div className="space-y-2">
                    {logs.filter((l) => l.topicId === node.id && l.type === "revisão").sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map((log) => (
                      <div key={log.id} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <span>🔄</span>
                        <p className="flex-1 text-sm text-slate-700">{log.message}</p>
                        {log.performance !== undefined && <span className={`text-xs font-bold ${performanceColor(log.performance)}`}>{log.performance}%</span>}
                        <span className="text-xs text-slate-400">{fmtDate(log.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => setTab("logs")} className="w-full py-2 border border-dashed border-blue-300 rounded-xl text-xs text-blue-500 hover:bg-blue-50 transition-colors">
                + Registrar nova revisão nos Logs
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Global Logs Panel
// ────────────────────────────────────────────────────────────
function GlobalLogsPanel({ logs, nodes, onClose, filterNodeId, setFilterNodeId }: {
  logs: StudyLog[]; nodes: TopicNode[]; onClose: () => void; filterNodeId: string | null; setFilterNodeId: (id: string | null) => void;
}) {
  const [typeFilter, setTypeFilter] = useState<LogType | "todos">("todos");
  const filtered = logs
    .filter((l) => (filterNodeId ? l.topicId === filterNodeId : true) && (typeFilter !== "todos" ? l.type === typeFilter : true))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>

        <div className="bg-indigo-900 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-indigo-300 uppercase tracking-widest mb-0.5">Sistema de Logs</p>
            <h2 className="font-bold text-base">Todos os Registros</h2>
          </div>
          <button onClick={onClose} className="text-indigo-300 hover:text-white transition-colors text-xl">✕</button>
        </div>

        <div className="p-3 border-b border-slate-200 bg-slate-50 flex gap-2 flex-wrap items-center">
          <select value={filterNodeId ?? ""} onChange={(e) => setFilterNodeId(e.target.value || null)}
            className="text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 max-w-52">
            <option value="">Todos os tópicos</option>
            {nodes.filter((n) => logs.some((l) => l.topicId === n.id)).map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
          <div className="flex gap-1 flex-wrap">
            {(["todos", ...LOG_TYPE_OPTIONS] as const).map((t) => (
              <button key={t} onClick={() => setTypeFilter(t as LogType | "todos")}
                className={`text-xs px-2 py-1 rounded-lg border transition-colors ${typeFilter === t ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"}`}>
                {t === "todos" ? "Todos" : `${logTypeIcon(t as LogType)} ${t}`}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} registro{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {filtered.length === 0 && <p className="text-center text-slate-400 text-sm py-6">Nenhum log encontrado.</p>}
          {filtered.map((log) => (
            <div key={log.id} className="flex gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 transition-colors">
              <span className="text-lg leading-none mt-0.5">{logTypeIcon(log.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${logTypeColor(log.type)}`}>{log.type}</span>
                  <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded truncate max-w-[140px]">{log.nodeName}</span>
                  {log.performance !== undefined && <span className={`text-xs font-semibold ${performanceColor(log.performance)}`}>{log.performance}%</span>}
                  <span className="text-xs text-slate-400 ml-auto">{fmtDateTime(log.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-700 leading-snug">{log.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Node Row
// ────────────────────────────────────────────────────────────
interface RowProps {
  subject: Subject;
  node: TopicNode; tree: Map<string | null, TopicNode[]>; collapsed: Set<string>;
  logs: StudyLog[]; onToggle: (id: string) => void; onUpdate: (id: string, patch: Partial<TopicNode>) => void;
  onOpenDetail: (node: TopicNode) => void; depth?: number;
}

function NodeRow({ subject, node, tree, collapsed, logs, onToggle, onUpdate, onOpenDetail, depth = 0 }: RowProps) {
  const children = tree.get(node.id) ?? [];
  const hasChildren = children.length > 0;
  const isCollapsed = collapsed.has(node.id);
  const isRoot = node.level === 0;
  const isGroupHeader = hasChildren && node.level >= 1;
  const openPendencies = node.metadata.pendencies.filter((p) => !p.resolved).length;
  const nodeLogCount = logs.filter((l) => l.topicId === node.id).length;


  const updateMeta = (patch: Partial<TopicNode["metadata"]>) => onUpdate(node.id, { metadata: { ...node.metadata, ...patch } });
  const updateMetrics = (patch: Partial<TopicNode["metrics"]>) => onUpdate(node.id, { metrics: { ...node.metrics, ...patch } });

  if (isRoot) {
    return (
      <>
        <tr className="cursor-pointer select-none" onClick={() => onToggle(node.id)}>
          <td colSpan={9} className="py-1.5 px-3">
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 flex items-center justify-center rounded text-xs font-bold text-indigo-600 transition-transform ${isCollapsed ? "" : "rotate-90"}`}>▶</span>
              <span className="font-bold text-base text-indigo-700 underline underline-offset-2 tracking-wide">{subject.name}</span>
              <span className={`ml-1 w-2 h-2 rounded-full ${ccaDot(node.status)}`} />
            </div>
          </td>
        </tr>
        {!isCollapsed && children.map((c) => <NodeRow key={c.id} subject={subject} node={c} tree={tree} collapsed={collapsed} logs={logs} onToggle={onToggle} onUpdate={onUpdate} onOpenDetail={onOpenDetail} depth={depth + 1} />)}
      </>
    );
  }

  return (
    <>
      <tr className="group border-b border-slate-100 hover:bg-indigo-50/40 transition-colors">
        <td className="py-1.5 px-2 w-6 " style={{ paddingLeft: `${depth * 16 + 8}px` }}>
          {hasChildren &&
            <button onClick={() => onToggle(node.id)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200">
              <span className={`text-xs text-slate-500 transition-transform ${isCollapsed ? "" : "rotate-90"}`}>▶</span>
            </button>}
        </td>

        {/* Name */}
        <td className="py-1.5 text-sm text-slate-700" style={{ paddingLeft: `${depth * 16 + 8}px` }}>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ccaDot(node.status)}`} />
            <span className="truncate max-w-[160px]">{node.name}</span>
            {openPendencies > 0 && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">{openPendencies}⚠</span>}
          </div>
        </td>

        {/* Aula */}
        <td className="py-1.5 px-2 text-center">
          <Sel value={node.metadata.videoClassStatus} options={VIDEO_STATUS_OPTIONS} onChange={(v) => updateMeta({ videoClassStatus: v })} colorFn={videoStatusColor} />
        </td>

        {/* Questões */}
        <td className="py-1.5 px-2 text-center">
          <Sel value={node.metadata.questionStatus} options={QUESTION_STATUS_OPTIONS} onChange={(v) => updateMeta({ questionStatus: v })} colorFn={questionStatusColor} />
        </td>

        {/* Revisão */}
        <td className="py-1.5 px-2 text-center">
          <div className="flex flex-col items-center gap-0.5">
            <Sel value={node.metadata.reviewStatus} options={REVIEW_STATUS_OPTIONS} onChange={(v) => updateMeta({ reviewStatus: v })} colorFn={reviewStatusColor} />
            {node.metadata.reviewDate && (
              <span className="text-xs text-slate-400">{new Date(node.metadata.reviewDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>
            )}
          </div>
        </td>

        {/* CCA */}
        <td className="py-1.5 px-2 text-center">
          <Sel value={node.status} options={CCA_OPTIONS} onChange={(v) => onUpdate(node.id, { status: v as CCAStatus })} colorFn={ccaSelectColor} />
        </td>

        {/* Nº Questões */}
        <td className="py-1.5 px-2 text-center">
          <input type="number" min={0} max={999} value={node.metrics.questionsSolved} onChange={(e) => updateMetrics({ questionsSolved: parseInt(e.target.value) || 0 })}
            className="w-14 text-xs text-center border border-slate-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white" />
        </td>

        {/* Desempenho */}
        <td className="py-1.5 px-3">
          <div className="flex items-center gap-1">
            <PerformanceBar value={node.metrics.lastPerformance} />
            <input type="number" min={0} max={100} value={node.metrics.lastPerformance}
              onChange={(e) => updateMetrics({ lastPerformance: Math.min(100, parseInt(e.target.value) || 0) })}
              className="w-12 text-xs text-center border border-slate-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </td>

        {/* Detail button */}
        <td className="py-1.5 px-2 text-center">
          <button onClick={() => onOpenDetail(node)}
            className="relative w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 transition-colors text-sm flex items-center justify-center">
            📋
            {nodeLogCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-500 text-white rounded-full flex items-center justify-center leading-none" style={{ fontSize: "9px" }}>{nodeLogCount > 9 ? "9+" : nodeLogCount}</span>
            )}
          </button>
        </td>
      </tr>
      {!isCollapsed && children.map((c) => <NodeRow key={c.id} subject={subject} node={c} tree={tree} collapsed={collapsed} logs={logs} onToggle={onToggle} onUpdate={onUpdate} onOpenDetail={onOpenDetail} depth={depth + 1} />)}
    </>
  );
}

// ────────────────────────────────────────────────────────────
// Stats Cards
// ────────────────────────────────────────────────────────────
function StatsBar({ nodes, logs, onOpenLogs }: { nodes: TopicNode[]; logs: StudyLog[]; onOpenLogs: () => void }) {
  const leaves = nodes.filter((n) => !nodes.some((m) => m.parentId === n.id));
  const total = leaves.length || 1;
  const fraca = leaves.filter((n) => n.status === "Fraca").length;
  const medio = leaves.filter((n) => n.status === "Médio").length;
  const confiante = leaves.filter((n) => n.status === "Confiante").length;
  const withPerf = leaves.filter((n) => n.metrics.lastPerformance > 0);
  const avgPerf = withPerf.length > 0 ? Math.round(withPerf.reduce((s, n) => s + n.metrics.lastPerformance, 0) / withPerf.length) : 0;
  const totalQ = leaves.reduce((s, n) => s + n.metrics.questionsSolved, 0);
  const openPendencies = nodes.reduce((s, n) => s + n.metadata.pendencies.filter((p) => !p.resolved).length, 0);
  const pendingReviews = leaves.filter((n) => n.metadata.reviewStatus === "Agendada").length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Progresso CCA</p>
        <p className="text-2xl font-bold text-indigo-600">{Math.round(((fraca + medio + confiante) / total) * 100)}%</p>
        <div className="flex gap-1 mt-1.5">
          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
            <div className="bg-red-500 h-full" style={{ width: `${(fraca / total) * 100}%` }} />
            <div className="bg-amber-400 h-full" style={{ width: `${(medio / total) * 100}%` }} />
            <div className="bg-emerald-500 h-full" style={{ width: `${(confiante / total) * 100}%` }} />
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-1">{fraca} fraca · {medio} medio · {confiante} confiante</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Questões</p>
        <p className="text-2xl font-bold text-emerald-600">{totalQ}</p>
        <p className="text-xs text-slate-400 mt-0.5">{avgPerf > 0 ? `${avgPerf}% de média` : "sem dados de desempenho"}</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Pendências</p>
        <p className={`text-2xl font-bold ${openPendencies > 0 ? "text-red-500" : "text-emerald-600"}`}>{openPendencies}</p>
        <p className="text-xs text-slate-400 mt-0.5">{pendingReviews} revisão{pendingReviews !== 1 ? "ões" : ""} agendada{pendingReviews !== 1 ? "s" : ""}</p>
      </div>
      <div onClick={onOpenLogs} className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Logs</p>
        <p className="text-2xl font-bold text-violet-600">{logs.length}</p>
        <p className="text-xs text-indigo-400 mt-0.5">clique para visualizar →</p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────
export default function StudyControlTable() {
  const [nodes, setNodes] = useState<TopicNode[]>(INITIAL_NODES);
  const [logs, setLogs] = useState<StudyLog[]>(INITIAL_LOGS);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [detailNode, setDetailNode] = useState<TopicNode | null>(null);
  const [showGlobalLogs, setShowGlobalLogs] = useState(false);
  const [logFilterNode, setLogFilterNode] = useState<string | null>(null);

  const tree = useMemo(() => buildTree(nodes), [nodes]);
  const filteredRoots = useMemo(() => {
    const roots = tree.get(null) ?? [];
    if (!search.trim()) return roots;
    const q = search.toLowerCase();
    const getAllDesc = (id: string): TopicNode[] => { const ch = tree.get(id) ?? []; return [...ch, ...ch.flatMap((c) => getAllDesc(c.id))]; };
    return roots.filter((r) => r.name.toLowerCase().includes(q) || getAllDesc(r.id).some((n) => n.name.toLowerCase().includes(q)));
  }, [tree, nodes, search]);

  const toggleCollapse = (id: string) => setCollapsed((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const updateNode = (id: string, patch: Partial<TopicNode>) => {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, ...patch } : n));
    setDetailNode((prev) => prev?.id === id ? { ...prev, ...patch } : prev);
  };

  const addLog = (log: StudyLog) => setLogs((prev) => [...prev, log]);
  const collapseAll = () => setCollapsed(new Set(nodes.map((n) => n.id)));
  const expandAll = () => setCollapsed(new Set());

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #fafafa 50%, #f5f0ff 100%)", fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap'); * { font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif; }`}</style>

      {/* Header */}
      <div className="mb-5 flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-end gap-3 mb-0.5">
            <h1 className="text-2xl font-bold text-indigo-900 tracking-tight">Controle de Estudos</h1>
            <span className="text-sm text-slate-500 mb-0.5">sistema CCA</span>
          </div>
          <p className="text-xs text-slate-500">Codificação → Consolidação → Ativação</p>
        </div>
        <button onClick={() => { setLogFilterNode(null); setShowGlobalLogs(true); }}
          className="flex items-center gap-2 text-xs px-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold shadow-sm">
          📋 Ver todos os Logs
          <span className="bg-indigo-500 px-1.5 py-0.5 rounded-full">{logs.length}</span>
        </button>
      </div>

      <StatsBar nodes={nodes} logs={logs} onOpenLogs={() => { setLogFilterNode(null); setShowGlobalLogs(true); }} />

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <input type="text" placeholder="Buscar tópico..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="text-sm px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 w-56" />
        <div className="flex gap-2 ml-auto">
          <button onClick={expandAll} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 text-slate-600 transition-colors">Expandir</button>
          <button onClick={collapseAll} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 text-slate-600 transition-colors">Recolher</button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 overflow-x-auto shadow-sm bg-white">
        <table className="w-full border-collapse min-w-[860px]">
          <thead>
            <tr className="bg-indigo-900 text-white text-xs uppercase tracking-wider">
              <th className="py-2.5 px-2 w-6" />
              <th className="py-2.5 px-3 text-left font-semibold">Tópico</th>
              <th className="py-2.5 px-2 text-center font-semibold">Aula</th>
              <th className="py-2.5 px-2 text-center font-semibold">Questões</th>
              <th className="py-2.5 px-2 text-center font-semibold">Revisão</th>
              <th className="py-2.5 px-2 text-center font-semibold">CCA</th>
              <th className="py-2.5 px-2 text-center font-semibold whitespace-nowrap">Nº Qs</th>
              <th className="py-2.5 px-3 text-left font-semibold">Desempenho</th>
              <th className="py-2.5 px-2 text-center font-semibold">Logs</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoots.map((root) => (
              <NodeRow key={root.id} subject={subjects.find(s => s.id === root.subjectId)!} node={root} tree={tree} collapsed={collapsed} logs={logs}
                onToggle={toggleCollapse} onUpdate={updateNode}
                onOpenDetail={(n) => { setDetailNode(n); setLogFilterNode(n.id); }}
                depth={0} />
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-center text-xs text-slate-400 mt-4">
        Clique em 📋 para abrir logs, pendências e revisão de cada tópico
      </p>

      {detailNode && (
        <DetailPanel node={detailNode} logs={logs} onClose={() => setDetailNode(null)} onUpdateNode={updateNode} onAddLog={addLog} />
      )}

      {showGlobalLogs && (
        <GlobalLogsPanel logs={logs} nodes={nodes} onClose={() => setShowGlobalLogs(false)} filterNodeId={logFilterNode} setFilterNodeId={setLogFilterNode} />
      )}
    </div>
  );
}