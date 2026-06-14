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

export const INITIAL_NODES: TopicNode[] = [
  { id: "ag", name: "Análise Gráfica", subjectId: "s1", parentId: null, level: 0, status: "Fraca", metrics: { lastPerformance: 0, questionsSolved: 0 }, metadata: { videoClassStatus: "Pular", questionStatus: "Pendente", reviewStatus: "Não Iniciada", pendencies: [] } },
  { id: "ag-topico", name: "Teste1", subjectId: "s1", parentId: "ag", level: 1, status: "Fraca", metrics: { lastPerformance: 0, questionsSolved: 0 }, metadata: { videoClassStatus: "Pular", questionStatus: "Pendente", reviewStatus: "Não Iniciada", pendencies: [] } },
  { id: "ag-main", name: "Análise Gráfica", subjectId: "s1", parentId: "ag-topico", level: 2, status: "Fraca", metrics: { lastPerformance: 0, questionsSolved: 0 }, metadata: { videoClassStatus: "Pular", questionStatus: "Pendente", reviewStatus: "Não Iniciada", pendencies: [] } },
  { id: "br", name: "Brasil", subjectId: "s2", parentId: null, level: 0, status: "Fraca", metrics: { lastPerformance: 0, questionsSolved: 0 }, metadata: { videoClassStatus: "Pular", questionStatus: "Pendente", reviewStatus: "Não Iniciada", pendencies: [] } },
  { id: "br-at-grp", name: "Teste2", subjectId: "s2", parentId: "br", level: 1, status: "Fraca", metrics: { lastPerformance: 0, questionsSolved: 0 }, metadata: { videoClassStatus: "Pular", questionStatus: "Pendente", reviewStatus: "Não Iniciada", pendencies: [] } },
  { id: "br-at", name: "Atualidades (Brasil)", subjectId: "s2", parentId: "br-at-grp", level: 2, status: "Fraca", metrics: { lastPerformance: 0, questionsSolved: 0 }, metadata: { videoClassStatus: "Pular", questionStatus: "Pendente", reviewStatus: "Não Iniciada", pendencies: [] } },
  { id: "br-div-grp", name: "Teste3", subjectId: "s2", parentId: "br", level: 1, status: "Fraca", metrics: { lastPerformance: 0, questionsSolved: 0 }, metadata: { videoClassStatus: "Pular", questionStatus: "Pendente", reviewStatus: "Não Iniciada", pendencies: [] } },

  { id: "br-div", name: "Divisão Política Administrativa", subjectId: "s2", parentId: "br-div-grp", level: 2, status: "Fraca", metrics: { lastPerformance: 0, questionsSolved: 0 }, metadata: { videoClassStatus: "Pular", questionStatus: "Pendente", reviewStatus: "Não Iniciada", pendencies: [] } },
  { id: "br-eco", name: "Economia (Brasil)", subjectId: "s2", parentId: "br", level: 1, status: "Fraca", metrics: { lastPerformance: 0, questionsSolved: 0 }, metadata: { videoClassStatus: "Pular", questionStatus: "Pendente", reviewStatus: "Não Iniciada", pendencies: [] } },
  { id: "br-agro", name: "Agronegócios (Brasil)", subjectId: "s2", parentId: "br-eco", level: 2, status: "Fraca", metrics: { lastPerformance: 0, questionsSolved: 0 }, metadata: { videoClassStatus: "Pular", questionStatus: "Pendente", reviewStatus: "Não Iniciada", pendencies: [] } },
  { id: "br-agro-agri", name: "Agricultura (Brasil Agronegócios)", subjectId: "s2", parentId: "br-agro", level: 3, status: "Fraca", metrics: { lastPerformance: 0, questionsSolved: 0 }, metadata: { videoClassStatus: "Pular", questionStatus: "Pendente", reviewStatus: "Não Iniciada", pendencies: [] } },
  { id: "br-agro-pec", name: "Pecuária (Brasil Agronegócios)", subjectId: "s2", parentId: "br-agro", level: 3, status: "Fraca", metrics: { lastPerformance: 0, questionsSolved: 0 }, metadata: { videoClassStatus: "Pular", questionStatus: "Pendente", reviewStatus: "Não Iniciada", pendencies: [] } },
  { id: "br-agro-pes", name: "Pesca (Brasil Agronegócios)", subjectId: "s2", parentId: "br-agro", level: 3, status: "Fraca", metrics: { lastPerformance: 0, questionsSolved: 0 }, metadata: { videoClassStatus: "Pular", questionStatus: "Pendente", reviewStatus: "Não Iniciada", pendencies: [] } },

  {
    id: "br-extr", name: "Extrativismo", subjectId: "s2", parentId: "br-eco", level: 2, status: "Fraca", metrics: { lastPerformance: 65, questionsSolved: 20, lastStudyDate: new Date("2025-01-08") }, metadata: {
      videoClassStatus: "Assistida", questionStatus: "Concluída", reviewStatus: "Não Iniciada",
      pendencies: [
        { id: "p2", text: "Ver questões de petróleo pré-sal", resolved: false, createdAt: new Date("2025-01-08") },
        { id: "p3", text: "Tabela de minerais por estado", resolved: true, createdAt: new Date("2025-01-08") }
      ]
    }
  },
  { id: "br-font", name: "Fontes de energia", subjectId: "s2", parentId: "br-eco", level: 2, status: "Fraca", metrics: { lastPerformance: 0, questionsSolved: 0 }, metadata: { videoClassStatus: "Pular", questionStatus: "Pendente", reviewStatus: "Não Iniciada", pendencies: [] } },
  { id: "br-glob", name: "Globalização (Brasil)", subjectId: "s2", parentId: "br-eco", level: 2, status: "Fraca", metrics: { lastPerformance: 0, questionsSolved: 0 }, metadata: { videoClassStatus: "Pular", questionStatus: "Pendente", reviewStatus: "Não Iniciada", pendencies: [] } },
  { id: "br-ind", name: "Indústria (Brasil)", subjectId: "s2", parentId: "br-eco", level: 2, status: "Fraca", metrics: { lastPerformance: 91, questionsSolved: 60, lastStudyDate: new Date("2025-01-18") }, metadata: { videoClassStatus: "Assistida", questionStatus: "Concluída", reviewStatus: "Concluída", reviewDate: "2025-01-22", pendencies: [] } },
  { id: "br-serv", name: "Serviços (Brasil)", subjectId: "s2", parentId: "br-eco", level: 2, status: "Fraca", metrics: { lastPerformance: 55, questionsSolved: 15 }, metadata: { videoClassStatus: "Assistida", questionStatus: "Pendente", reviewStatus: "Agendada", reviewDate: "2025-02-25", pendencies: [{ id: "p4", text: "Resolver mais 20 questões de turismo", resolved: false, createdAt: new Date("2025-01-12") }] } },
  { id: "br-trans", name: "Transportes", subjectId: "s2", parentId: "br-eco", level: 2, status: "Fraca", metrics: { lastPerformance: 0, questionsSolved: 0 }, metadata: { videoClassStatus: "Pular", questionStatus: "Pendente", reviewStatus: "Não Iniciada", pendencies: [] } },
];

export const INITIAL_LOGS: StudyLog[] = [
  { id: "l1", topicId: "br-com", nodeName: "Comércio exterior e blocos econômicos", type: "estudo", message: "Assistiu aula completa sobre MERCOSUL e OMC", performance: 72, createdAt: new Date("2025-01-10T14:30:00") },
  { id: "l2", topicId: "br-comun", nodeName: "Comunicações", type: "questões", message: "Resolveu 45 questões — desempenho excelente", performance: 88, createdAt: new Date("2025-01-15T10:00:00") },
  { id: "l3", topicId: "br-comun", nodeName: "Comunicações", type: "revisão", message: "Revisão completa. Consolidou o conteúdo.", performance: 90, createdAt: new Date("2025-01-20T16:00:00") },
  { id: "l4", topicId: "br-extr", nodeName: "Extrativismo", type: "pendência", message: "Identificou lacuna em questões de petróleo pré-sal", createdAt: new Date("2025-01-08T11:00:00") },
  { id: "l5", topicId: "br-ind", nodeName: "Indústria (Brasil)", type: "estudo", message: "Aula + questões concluídas com ótimo resultado", performance: 91, createdAt: new Date("2025-01-18T09:00:00") },
];
