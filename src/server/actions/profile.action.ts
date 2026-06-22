"use server";

import type {
  ProfileData,
  ProfileBadge,
  ProfileStats,
  ProfileSubject,
  ProfileSession,
  ProfileUser,
} from "@/app/(protected)/profile/types";

// ─── MOCK DATA (substitui queries reais até integração com produção) ───────────
// Simula dados realistas para testar a UI antes de conectar ao banco real.

const MOCK_USER: ProfileUser = {
  id: "mock-user-id",
  name: "Pedro Freitas",
  email: "pedro@studilab.dev",
  image: null,
  createdAt: new Date("2024-01-15"),
};

const MOCK_SUBJECTS: ProfileSubject[] = [
  { name: "Matemática", color: "#4f46e5", minutes: 1110 }, // 18.5h
  { name: "Química", color: "#0891b2", minutes: 840 },     // 14h
  { name: "Biologia", color: "#16a34a", minutes: 690 },    // 11.5h
  { name: "Física", color: "#b45309", minutes: 540 },      // 9h
  { name: "Português", color: "#be185d", minutes: 450 },   // 7.5h
];

const MOCK_SESSIONS: ProfileSession[] = [
  {
    id: "s1",
    subjectName: "Matemática",
    subjectColor: "#4f46e5",
    topicName: "Limites e Derivadas",
    duration_minutes: 260,
    start_time: new Date("2025-11-15T23:00:00"),
    study_date: new Date("2025-11-15"),
    notes: "Revisão completa",
  },
  {
    id: "s2",
    subjectName: "Biologia",
    subjectColor: "#16a34a",
    topicName: "Mitose & Meiose",
    duration_minutes: 165,
    start_time: new Date("2025-11-14T15:30:00"),
    study_date: new Date("2025-11-14"),
  },
  {
    id: "s3",
    subjectName: "Química",
    subjectColor: "#0891b2",
    topicName: "Reações Orgânicas",
    duration_minutes: 180,
    start_time: new Date("2025-11-13T09:00:00"),
    study_date: new Date("2025-11-13"),
  },
  {
    id: "s4",
    subjectName: "Português",
    subjectColor: "#be185d",
    topicName: "Redação — Tecnologia",
    duration_minutes: 90,
    start_time: new Date("2025-11-12T20:00:00"),
    study_date: new Date("2025-11-12"),
  },
  {
    id: "s5",
    subjectName: "Física",
    subjectColor: "#b45309",
    topicName: "Dinâmica — Força",
    duration_minutes: 135,
    start_time: new Date("2025-11-11T14:00:00"),
    study_date: new Date("2025-11-11"),
  },
  {
    id: "s6",
    subjectName: "Matemática",
    subjectColor: "#4f46e5",
    topicName: "Funções & Gráficos",
    duration_minutes: 230,
    start_time: new Date("2025-11-10T22:00:00"),
    study_date: new Date("2025-11-10"),
  },
  {
    id: "s7",
    subjectName: "Biologia",
    subjectColor: "#16a34a",
    topicName: "Genética Mendeliana",
    duration_minutes: 120,
    start_time: new Date("2025-11-09T11:00:00"),
    study_date: new Date("2025-11-09"),
  },
  {
    id: "s8",
    subjectName: "Química",
    subjectColor: "#0891b2",
    topicName: "Eletroquímica",
    duration_minutes: 250,
    start_time: new Date("2025-11-08T10:00:00"),
    study_date: new Date("2025-11-08"),
  },
  {
    id: "s9",
    subjectName: "Matemática",
    subjectColor: "#4f46e5",
    topicName: "Progressões Aritméticas",
    duration_minutes: 200,
    start_time: new Date("2025-11-07T21:00:00"),
    study_date: new Date("2025-11-07"),
  },
];

// Heatmap simulado: últimos 182 dias (6 meses)
function buildMockHeatmap(): Record<string, number> {
  const map: Record<string, number> = {};
  const today = new Date("2025-11-07T21:00:00");
  for (let i = 181; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    // Deterministic pseudo-random based on index to avoid Next.js Math.random() error
    const rand = ((i * 17) % 100) / 100;
    if (rand < 0.30) {
      map[key] = 0;
    } else if (rand < 0.50) {
      map[key] = ((i * 7) % 60) + 30;   // 30–90 min
    } else if (rand < 0.70) {
      map[key] = ((i * 11) % 120) + 90;  // 90–210 min
    } else if (rand < 0.85) {
      map[key] = ((i * 13) % 180) + 210; // 210–390 min
    } else {
      map[key] = ((i * 19) % 120) + 390; // 390–510 min
    }
  }
  return map;
}

const MOCK_STATS: ProfileStats = {
  totalMinutes: 74400,    // 1240h
  totalSessions: 312,
  studyDays: 289,
  currentStreak: 47,
  longestStreak: 63,
  bestWeekMinutes: 3120,  // 52h
  bestWeekLabel: "18 Nov – 24 Nov",
  weeklyMinutes: 2964,    // ~49.4h
  avgMinutesPerDay: 257,
};

// Badges calculadas a partir das stats/sessões mockadas
const MOCK_BADGES: ProfileBadge[] = [
  {
    emoji: "🌙",
    name: "Coruja da Madrugada",
    desc: "30+ sessões após 23h",
    rarity: "Ultra Rara",
    locked: false,
  },
  {
    emoji: "🔥",
    name: "Em Chamas",
    desc: "Streak de 30 dias",
    rarity: "Rara",
    locked: false,
  },
  {
    emoji: "⚡",
    name: "Relâmpago",
    desc: "10h em um único dia",
    rarity: "Épica",
    locked: false,
  },
  {
    emoji: "📚",
    name: "Polímata",
    desc: "5 matérias no mesmo dia",
    rarity: "Incomum",
    locked: false,
  },
  {
    emoji: "🏆",
    name: "Centenário",
    desc: "100 dias de estudo",
    rarity: "Rara",
    locked: false,
  },
  {
    emoji: "🌅",
    name: "Madrugador",
    desc: "20 sessões antes das 6h",
    rarity: "Incomum",
    locked: false,
  },
  {
    emoji: "💎",
    name: "Diamante",
    desc: "500 horas totais",
    rarity: "Lendária",
    locked: false,
  },
  {
    emoji: "🚀",
    name: "Lançamento",
    desc: "1000 horas totais",
    rarity: "Lendária",
    locked: true,
  },
  {
    emoji: "👑",
    name: "Coroa",
    desc: "Top 1% na plataforma",
    rarity: "Mítica",
    locked: true,
  },
];

// ─── Action Principal ──────────────────────────────────────────────────────────
// TODO: Substituir o retorno de MOCK data por queries reais ao Prisma
// quando pronto para produção. Manter a mesma assinatura de retorno.

export async function getProfileDataAction(): Promise<ProfileData> {
  // await requireAuth(); // ← descomentar quando conectar ao banco real

  // Simula latência de rede para testar estados de loading
  // await new Promise((r) => setTimeout(r, 300));

  return {
    user: MOCK_USER,
    stats: MOCK_STATS,
    topSubjects: MOCK_SUBJECTS,
    recentSessions: MOCK_SESSIONS,
    heatmap: buildMockHeatmap(),
    badges: MOCK_BADGES,
  };
}
