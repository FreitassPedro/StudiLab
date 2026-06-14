import { StudyBlock } from "./components/mockData";
import { parseTimeToMinutes } from "./utils";

export interface SubjectSummary {
  subject: string;
  color: StudyBlock["color"];
  plannedMinutes: number;
  doneMinutes: number;
  todoMinutes: number;
  blockCount: number;
  doneCount: number;
  todoCount: number;
  efficiencyPct: number; // (done / planned) * 100
  densityPct: number;    // subject share of total weekly time
  pendingTopics: string[];
  streak: number;        // consecutive days with ≥1 done block
  lastDoneDay: number | null;
}

export interface DayLoad {
  dayIndex: number;
  dayLabel: string;
  plannedMinutes: number;
  doneMinutes: number;
  freeMinutes: number; // from 8h study window
  blockCount: number;
  completionPct: number;
}

export interface WeekInsight {
  type: "danger" | "warning" | "success" | "info";
  icon: string;
  title: string;
  body: string;
  subject?: string;
}

export interface GapAlert {
  subject: string;
  color: StudyBlock["color"];
  severity: "critical" | "warning" | "ok";
  efficiencyPct: number;
  pendingBlocks: number;
  pendingTopics: string[];
  suggestion: string;
}

export interface WeekStats {
  totalPlannedMinutes: number;
  totalDoneMinutes: number;
  overallEfficiency: number;
  totalBlocks: number;
  doneBlocks: number;
  criticalGaps: number;
  mostLoadedDay: string;
  leastLoadedDay: string;
  busiestSubject: string;
}

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const STUDY_WINDOW_MINUTES = 8 * 60; // 8h reference window

export class PlannerAnalytics {
  private blocks: StudyBlock[];

  constructor(blocks: StudyBlock[]) {
    this.blocks = blocks;
  }

  // ── Subject summaries ────────────────────────────────────────────────────

  getSubjectSummaries(): SubjectSummary[] {
    const map = new Map<string, SubjectSummary>();

    for (const block of this.blocks) {
      const start = parseTimeToMinutes(block.startTime);
      const end = parseTimeToMinutes(block.endTime);
      const mins = Math.max(0, end - start);

      if (!map.has(block.subject)) {
        map.set(block.subject, {
          subject: block.subject,
          color: block.color,
          plannedMinutes: 0,
          doneMinutes: 0,
          todoMinutes: 0,
          blockCount: 0,
          doneCount: 0,
          todoCount: 0,
          efficiencyPct: 0,
          densityPct: 0,
          pendingTopics: [],
          streak: 0,
          lastDoneDay: null,
        });
      }

      const s = map.get(block.subject)!;
      s.plannedMinutes += mins;
      s.blockCount += 1;

      if (block.status === "done") {
        s.doneMinutes += mins;
        s.doneCount += 1;
        if (s.lastDoneDay === null || block.dayIndex > s.lastDoneDay) {
          s.lastDoneDay = block.dayIndex;
        }
      } else {
        s.todoMinutes += mins;
        s.todoCount += 1;
        if (block.topic) s.pendingTopics.push(block.topic);
      }
    }

    const totalPlanned = Array.from(map.values()).reduce(
      (acc, s) => acc + s.plannedMinutes,
      0
    );

    return Array.from(map.values())
      .map((s) => ({
        ...s,
        efficiencyPct:
          s.plannedMinutes > 0
            ? Math.round((s.doneMinutes / s.plannedMinutes) * 100)
            : 0,
        densityPct:
          totalPlanned > 0
            ? Math.round((s.plannedMinutes / totalPlanned) * 100)
            : 0,
        streak: this._calcStreak(s.subject),
      }))
      .sort((a, b) => b.plannedMinutes - a.plannedMinutes);
  }

  private _calcStreak(subject: string): number {
    const doneDays = new Set(
      this.blocks
        .filter((b) => b.subject === subject && b.status === "done")
        .map((b) => b.dayIndex)
    );
    let streak = 0;
    // count from day 6 backwards
    for (let d = 6; d >= 0; d--) {
      if (doneDays.has(d)) streak++;
      else break;
    }
    return streak;
  }

  // ── Day loads ─────────────────────────────────────────────────────────────

  getDayLoads(): DayLoad[] {
    return DAY_LABELS.map((label, dayIndex) => {
      const dayBlocks = this.blocks.filter((b) => b.dayIndex === dayIndex);
      const planned = dayBlocks.reduce((acc, b) => {
        const s = parseTimeToMinutes(b.startTime);
        const e = parseTimeToMinutes(b.endTime);
        return acc + Math.max(0, e - s);
      }, 0);
      const done = dayBlocks
        .filter((b) => b.status === "done")
        .reduce((acc, b) => {
          const s = parseTimeToMinutes(b.startTime);
          const e = parseTimeToMinutes(b.endTime);
          return acc + Math.max(0, e - s);
        }, 0);

      return {
        dayIndex,
        dayLabel: label,
        plannedMinutes: planned,
        doneMinutes: done,
        freeMinutes: Math.max(0, STUDY_WINDOW_MINUTES - planned),
        blockCount: dayBlocks.length,
        completionPct:
          planned > 0 ? Math.round((done / planned) * 100) : 0,
      };
    });
  }

  // ── Gap alerts ────────────────────────────────────────────────────────────

  getGapAlerts(): GapAlert[] {
    return this.getSubjectSummaries()
      .filter((s) => s.todoCount > 0 || s.efficiencyPct < 60)
      .map((s) => {
        const severity: GapAlert["severity"] =
          s.efficiencyPct === 0 ? "critical" : s.efficiencyPct < 50 ? "warning" : "ok";

        let suggestion = "";
        if (s.efficiencyPct === 0) {
          suggestion = `Nenhum bloco concluído. Considere redistribuir ${s.todoCount} bloco${s.todoCount > 1 ? "s" : ""} para dias com mais disponibilidade.`;
        } else if (s.efficiencyPct < 50) {
          suggestion = `Menos da metade concluída. Reduza a carga diária ou agrupe tópicos relacionados.`;
        } else {
          suggestion = `Progresso parcial. ${s.pendingTopics.slice(0, 2).join(", ")} ainda pendente${s.pendingTopics.length > 1 ? "s" : ""}.`;
        }

        return {
          subject: s.subject,
          color: s.color,
          severity,
          efficiencyPct: s.efficiencyPct,
          pendingBlocks: s.todoCount,
          pendingTopics: s.pendingTopics,
          suggestion,
        };
      })
      .sort((a, b) => a.efficiencyPct - b.efficiencyPct);
  }

  // ── Week-level stats ───────────────────────────────────────────────────────

  getWeekStats(): WeekStats {
    const summaries = this.getSubjectSummaries();
    const dayLoads = this.getDayLoads();

    const totalPlanned = summaries.reduce((a, s) => a + s.plannedMinutes, 0);
    const totalDone = summaries.reduce((a, s) => a + s.doneMinutes, 0);
    const totalBlocks = this.blocks.length;
    const doneBlocks = this.blocks.filter((b) => b.status === "done").length;
    const criticalGaps = summaries.filter((s) => s.efficiencyPct === 0 && s.plannedMinutes > 0).length;

    const activeDays = dayLoads.filter((d) => d.plannedMinutes > 0);
    const mostLoaded = activeDays.sort((a, b) => b.plannedMinutes - a.plannedMinutes)[0];
    const leastLoaded = activeDays.sort((a, b) => a.plannedMinutes - b.plannedMinutes)[0];

    return {
      totalPlannedMinutes: totalPlanned,
      totalDoneMinutes: totalDone,
      overallEfficiency: totalPlanned > 0 ? Math.round((totalDone / totalPlanned) * 100) : 0,
      totalBlocks,
      doneBlocks,
      criticalGaps,
      mostLoadedDay: mostLoaded?.dayLabel ?? "—",
      leastLoadedDay: leastLoaded?.dayLabel ?? "—",
      busiestSubject: summaries[0]?.subject ?? "—",
    };
  }

  // ── Actionable insights ───────────────────────────────────────────────────

  getInsights(): WeekInsight[] {
    const summaries = this.getSubjectSummaries();
    const dayLoads = this.getDayLoads();
    const insights: WeekInsight[] = [];

    // Critical: zero completion
    for (const s of summaries) {
      if (s.efficiencyPct === 0 && s.plannedMinutes > 0) {
        insights.push({
          type: "danger",
          icon: "alert",
          title: `${s.subject} sem progresso`,
          body: `${s.blockCount} bloco${s.blockCount > 1 ? "s" : ""} planejado${s.blockCount > 1 ? "s" : ""}, nenhum concluído. Reagende ou reduza a carga.`,
          subject: s.subject,
        });
      }
    }

    // Warning: overloaded days
    for (const d of dayLoads) {
      if (d.plannedMinutes > STUDY_WINDOW_MINUTES) {
        insights.push({
          type: "warning",
          icon: "clock",
          title: `${d.dayLabel} sobrecarregado`,
          body: `${Math.round(d.plannedMinutes / 60)}h planejadas — acima da janela de 8h. Mova blocos para ${
            dayLoads.filter((x) => x.freeMinutes > 60 && x.dayIndex !== d.dayIndex)[0]?.dayLabel ?? "outro dia"
          }.`,
        });
      }
    }

    // Info: dominance
    if (summaries[0] && summaries[0].densityPct > 35) {
      insights.push({
        type: "info",
        icon: "balance",
        title: `Concentração em ${summaries[0].subject}`,
        body: `${summaries[0].densityPct}% do tempo semanal em uma única matéria. Considere distribuir melhor.`,
        subject: summaries[0].subject,
      });
    }

    // Success: top performers
    const stars = summaries.filter((s) => s.efficiencyPct >= 90 && s.doneCount > 0);
    if (stars.length) {
      insights.push({
        type: "success",
        icon: "check",
        title: `Ótimo ritmo`,
        body: `${stars.map((s) => s.subject).join(", ")} com ≥90% de conclusão. Mantenha o ritmo!`,
      });
    }

    // Info: free slots suggestion
    const freeDays = dayLoads.filter((d) => d.freeMinutes >= 90 && d.blockCount < 3);
    if (freeDays.length) {
      const lowEff = summaries.filter((s) => s.efficiencyPct < 60 && s.todoCount > 0);
      if (lowEff.length) {
        insights.push({
          type: "info",
          icon: "slot",
          title: `Slot livre disponível`,
          body: `${freeDays.map((d) => d.dayLabel).join(", ")} tem espaço livre. Bom para recuperar ${lowEff[0].subject}.`,
          subject: lowEff[0].subject,
        });
      }
    }

    return insights.slice(0, 5);
  }

  // ── Balance score (0-100) ─────────────────────────────────────────────────
  // Measures how evenly distributed the study load is across subjects and days

  getBalanceScore(): number {
    const summaries = this.getSubjectSummaries();
    if (summaries.length === 0) return 100;

    // Coefficient of variation of densityPct (lower = more balanced)
    const densities = summaries.map((s) => s.densityPct);
    const mean = densities.reduce((a, b) => a + b, 0) / densities.length;
    const variance = densities.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / densities.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;

    // cv=0 (perfect balance) → 100, cv=1 (max imbalance) → 0
    return Math.max(0, Math.round((1 - Math.min(cv, 1)) * 100));
  }
}
