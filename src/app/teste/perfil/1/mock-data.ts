import type {
  UserProfile,
  Subject,
  Session,
  Badge,
  ShelfItem,
  ThemeConfig,
} from "./types";

// ── THEME CONFIGS ──
export const THEME_CONFIGS: ThemeConfig[] = [
  {
    key: "cyberpunk",
    label: "Cyberpunk",
    gradient: "from-violet-500 to-cyan-400",
    tooltip: "Cyberpunk",
  },
  {
    key: "lofi",
    label: "Lo-Fi Café",
    gradient: "from-amber-400 to-rose-400",
    tooltip: "Lo-Fi Café",
  },
  {
    key: "minimal",
    label: "Minimalista",
    gradient: "from-emerald-300 to-indigo-400",
    tooltip: "Minimalista",
  },
];

// ── THEME CLASSES ──
export const THEME_ACCENT: Record<string, Record<string, string>> = {
  cyberpunk: {
    accent: "#8b5cf6",
    accent2: "#06b6d4",
    accentText: "text-violet-300",
    accentBorder: "border-violet-500",
    accentBg: "bg-violet-500/15",
    accentGlow: "shadow-violet-500/25",
    bannerFrom: "#0f0f14",
    bannerMid: "#1a0a2e",
    bannerTo: "#0d1a2a",
    gradientFrom: "from-violet-900/40",
    gradientTo: "to-cyan-900/20",
    barGradient: "from-violet-500 to-cyan-400",
    ringColor: "border-violet-500/80",
    avatarGradient: "from-violet-500 to-cyan-400",
  },
  lofi: {
    accent: "#f59e0b",
    accent2: "#fb7185",
    accentText: "text-amber-300",
    accentBorder: "border-amber-500",
    accentBg: "bg-amber-500/15",
    accentGlow: "shadow-amber-500/25",
    bannerFrom: "#0f0a05",
    bannerMid: "#1f1208",
    bannerTo: "#180810",
    gradientFrom: "from-amber-900/40",
    gradientTo: "to-rose-900/20",
    barGradient: "from-amber-400 to-rose-400",
    ringColor: "border-amber-500/80",
    avatarGradient: "from-amber-400 to-rose-400",
  },
  minimal: {
    accent: "#6ee7b7",
    accent2: "#818cf8",
    accentText: "text-emerald-300",
    accentBorder: "border-emerald-400",
    accentBg: "bg-emerald-400/12",
    accentGlow: "shadow-emerald-400/20",
    bannerFrom: "#050f0a",
    bannerMid: "#0a1a12",
    bannerTo: "#050814",
    gradientFrom: "from-emerald-900/40",
    gradientTo: "to-indigo-900/20",
    barGradient: "from-emerald-400 to-indigo-400",
    ringColor: "border-emerald-400/80",
    avatarGradient: "from-emerald-300 to-indigo-400",
  },
};

// ── USER PROFILE MOCK ──
export const MOCK_USER: UserProfile = {
  name: "Pedro Almeida",
  username: "@pedroalmeida",
  avatarEmoji: "🦊",
  tier: "★ Elite III",
  status: "Ouvindo Lo-Fi e destruindo em Matemática",
  statusEmoji: "🎧",
  totalHours: "1.240h",
  consistency: "89%",
  daysRecorded: "312",
  goalEmoji: "🩺",
  goalText: "Medicina — FURG 2026",
  quote:
    "Cada hora estudada é um tijolo. Não vejo o muro ainda, mas sei que estou construindo.",
  quoteLabel: "Meu lema pessoal",
};

// ── TOP SUBJECTS MOCK ──
export const MOCK_SUBJECTS: Subject[] = [
  {
    emoji: "🧮",
    name: "Matemática",
    sub: "Cálculo & Álgebra",
    hours: 18.5,
    color: "#4f46e5",
  },
  {
    emoji: "⚗️",
    name: "Química",
    sub: "Orgânica & Inorgânica",
    hours: 14.0,
    color: "#0891b2",
  },
  {
    emoji: "🧬",
    name: "Biologia",
    sub: "Citologia & Genética",
    hours: 11.5,
    color: "#16a34a",
  },
  {
    emoji: "⚡",
    name: "Física",
    sub: "Mecânica Clássica",
    hours: 9.0,
    color: "#b45309",
  },
  {
    emoji: "📖",
    name: "Português",
    sub: "Gramática & Redação",
    hours: 7.5,
    color: "#be185d",
  },
];

// ── RECENT SESSIONS MOCK ──
export const MOCK_SESSIONS: Session[] = [
  {
    emoji: "📐",
    subject: "Matemática",
    duration: "4h 20min",
    time: "23:00",
    note: "Limites e Derivadas",
    color: "#4f46e5",
  },
  {
    emoji: "🧬",
    subject: "Biologia",
    duration: "2h 45min",
    time: "15:30",
    note: "Mitose & Meiose",
    color: "#16a34a",
  },
  {
    emoji: "⚗️",
    subject: "Química",
    duration: "3h 00min",
    time: "09:00",
    note: "Reações Orgânicas",
    color: "#0891b2",
  },
  {
    emoji: "📖",
    subject: "Redação",
    duration: "1h 30min",
    time: "20:00",
    note: "Tema: Tecnologia",
    color: "#be185d",
  },
  {
    emoji: "⚡",
    subject: "Física",
    duration: "2h 15min",
    time: "14:00",
    note: "Dinâmica — Força",
    color: "#b45309",
  },
  {
    emoji: "🧮",
    subject: "Matemática",
    duration: "3h 50min",
    time: "22:00",
    note: "Funções & Gráficos",
    color: "#4f46e5",
  },
  {
    emoji: "🌍",
    subject: "Geografia",
    duration: "1h 20min",
    time: "11:00",
    note: "Geopolítica Global",
    color: "#7c3aed",
  },
  {
    emoji: "📜",
    subject: "História",
    duration: "2h 00min",
    time: "16:00",
    note: "Brasil República",
    color: "#92400e",
  },
  {
    emoji: "⚗️",
    subject: "Química",
    duration: "4h 10min",
    time: "10:00",
    note: "Eletroquímica",
    color: "#0891b2",
  },
];

// ── RARITY COLORS ──
export const RARITY_COLORS: Record<string, string> = {
  "Ultra Rara": "#fbbf24",
  Rara: "#a78bfa",
  Épica: "#f472b6",
  Incomum: "#34d399",
  Lendária: "#60a5fa",
  Mítica: "#f43f5e",
};

// ── ACHIEVEMENT BADGES MOCK ──
export const MOCK_BADGES: Badge[] = [
  {
    emoji: "🌙",
    name: "Coruja da Madrugada",
    desc: "30 sessões após 23h",
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
    desc: "10h em um dia",
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

// ── SHELF (Pinned resources) MOCK ──
export const MOCK_SHELF: ShelfItem[] = [
  {
    emoji: "📕",
    title: "Osvaldo Frota",
    sub: "Química — Vol. 2",
    type: "Livro",
    progress: 68,
  },
  {
    emoji: "🎧",
    title: "Lo-Fi Study Beats",
    sub: "Spotify Playlist",
    type: "Playlist",
    progress: null,
  },
  {
    emoji: "📹",
    title: "Equaciona",
    sub: "Canal no YouTube",
    type: "Canal",
    progress: null,
  },
  {
    emoji: "📒",
    title: "Caderno de Erros",
    sub: "Revisão pessoal",
    type: "Anotação",
    progress: 45,
  },
];
