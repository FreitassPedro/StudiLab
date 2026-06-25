// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────
export type CCAStatus = "Fraca" | "Médio" | "Confiante";
export type VideoClassStatus = "Pendente" | "Assistida" | "Pular";
export type QuestionStatus = "Pendente" | "Concluída";
export type ReviewStatus = "Não Iniciada" | "Agendada" | "Concluída";
export type LogType = "estudo" | "revisão" | "questões" | "pendência" | "nota";

export interface Pendency {
  id: string;
  text: string;
  resolved: boolean;
  createdAt: Date;
  studyLogId?: string;
}
export interface Subject {
  id: string;
  name: string;
}

export interface StudyLog {
  id: string;
  topicId: string;
  nodeName: string;
  type: LogType;
  message: string;
  performance?: number;
  createdAt: Date;
}

export interface TopicClosure {
  ancestorId: string;
  descendantId: string;
  depth: number;
}

export interface Topic {
  id: string;
  name: string;
}

export interface TopicNode {
  id: string;
  name: string;
  parentId: string | null;
  subjectId: string;
  level: number;
  status: CCAStatus;
  metrics: {
    lastPerformance: number;
    questionsSolved: number;
    lastStudyDate?: Date;
  };
  metadata: {
    videoClassStatus: VideoClassStatus;
    questionStatus: QuestionStatus;
    reviewStatus: ReviewStatus;
    reviewDate?: string;
    pendencies: Pendency[];
  };
}

// ────────────────────────────────────────────────────────────
// Sample Data
// ────────────────────────────────────────────────────────────
export const INITIAL_SUBJECTS: Subject[] = [
  { id: "s1", name: "Geografia" },
  { id: "s2", name: "História" },
  { id: "s3", name: "Matemática" },
  { id: "s4", name: "Física" },
  { id: "s5", name: "Química" },
  { id: "s6", name: "Biologia" }
];

export const INITIAL_TOPICS: Topic[] = [
  { id: "t1", name: "Análise Gráfica" },
  { id: "t2", name: "Brasil" },
  { id: "t3", name: "Comunicações" },
  { id: "t4", name: "Comércio exterior e blocos econômicos" },
  { id: "t5", name: "Economia (Brasil)" },
  { id: "t6", name: "Indústria (Brasil)" },
  { id: "pg1", name: "Programação" },
  { id: "pg4", name: "Web" },
  { id: "pg5", name: "REST" },
  { id: "pg6", name: "Java" },
  { id: "pg2", name: "Algoritmos" },
  { id: "pg3", name: "Estruturas de Dados" },
];

export const INITIAL_CLOSURES: TopicClosure[] = [
  { ancestorId: "ag", descendantId: "ag", depth: 0 },
  { ancestorId: "ag", descendantId: "ag-topico", depth: 1 },
  { ancestorId: "ag", descendantId: "ag-main", depth: 2 },
  { ancestorId: "br", descendantId: "br", depth: 0 },
  { ancestorId: "br", descendantId: "br-at-grp", depth: 1 },
  { ancestorId: "br", descendantId: "br-at", depth: 2 },
  { ancestorId: "br", descendantId: "br-div-grp", depth: 1 },
  { ancestorId: "br", descendantId: "br-div", depth: 2 },
  { ancestorId: "pg1", descendantId: "pg4", depth: 1 },
  { ancestorId: "pg1", descendantId: "pg5", depth: 1 },
  { ancestorId: "pg1", descendantId: "pg6", depth: 1 },
  { ancestorId: "pg2", descendantId: "pg3", depth: 1 },
];



export const INITIAL_LOGS: StudyLog[] = [
  { id: "l1", topicId: "br-com", nodeName: "Comércio exterior e blocos econômicos", type: "estudo", message: "Assistiu aula completa sobre MERCOSUL e OMC", performance: 72, createdAt: new Date("2025-01-10T14:30:00") },
  { id: "l2", topicId: "br-comun", nodeName: "Comunicações", type: "questões", message: "Resolveu 45 questões — desempenho excelente", performance: 88, createdAt: new Date("2025-01-15T10:00:00") },
  { id: "l3", topicId: "br-comun", nodeName: "Comunicações", type: "revisão", message: "Revisão completa. Consolidou o conteúdo.", performance: 90, createdAt: new Date("2025-01-20T16:00:00") },
  { id: "l4", topicId: "br-extr", nodeName: "Extrativismo", type: "pendência", message: "Identificou lacuna em questões de petróleo pré-sal", createdAt: new Date("2025-01-08T11:00:00") },
  { id: "l5", topicId: "br-ind", nodeName: "Indústria (Brasil)", type: "estudo", message: "Aula + questões concluídas com ótimo resultado", performance: 91, createdAt: new Date("2025-01-18T09:00:00") },
];
