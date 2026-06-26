# Arquitetura de Data Fetching e Cache (V3 - Otimizada)

Este documento define a arquitetura final de busca de dados, projetada para máxima performance (Single-Pass Server Processing) e economia de banco de dados.

## 🧠 Guia Didático: Qual Cache Devo Usar?

No ecossistema moderno do Next.js com React Query, temos **4 tipos diferentes de cache**. É crucial saber quando usar cada um ao criar novas funções:

### 1. Request Memoization (React `cache()`)
- **O que faz:** Memoriza o resultado de uma função **apenas durante o tempo de vida de 1 requisição no servidor**. Assim que a página termina de carregar, esse cache é destruído.
- **Quando usar:** Quando você tem múltiplos *Server Components* que precisam do mesmo dado básico (ex: `getCurrentUser` ou `getSubjectsAction`). Se o Header e a Sidebar chamarem `getCurrentUser()` no servidor, a função só vai no banco de dados 1 vez.
- **Como usar:** Envolva a função com `cache(async () => { ... })`.

### 2. Data Cache (Next.js `unstable_cache`)
- **O que faz:** Memoriza o resultado no servidor de forma **persistente**, sobrevivendo a milhares de requisições e diferentes usuários, até que você explicitamente o destrua (Invalidação por Tag).
- **Quando usar:** Para cálculos massivos ou consultas caras ao banco de dados que não precisam ser recalculadas a cada F5 (ex: total de horas de estudo do mês, geração de mapas de calor do perfil).
- **Como usar:** Envolva a lógica com `unstable_cache(async () => { ... }, ['chave'], { tags: ['minha-tag'] })`. E quando o dado mudar, chame `revalidateTag('minha-tag')`.

### 3. Client Cache (TanStack / React Query)
- **O que faz:** Memoriza dados no navegador do usuário (Client-side) para navegação instantânea.
- **Quando usar:** Para absolutamente **toda** busca de dados que ocorra em componentes do cliente (`"use client"`). É o que usamos na pasta `src/hooks`.
- **Como usar:** Use `useQuery` com chaves bem definidas em `src/lib/query-keys.ts`. Quando o usuário alterar algo, chame `queryClient.invalidateQueries`.

### 4. Router Cache (Next.js)
- **O que faz:** O Next.js guarda pedaços das páginas que você já visitou na memória do seu navegador para não recarregá-las se você apertar o botão "Voltar".
- **Quando usar:** É automático. Mas se você fizer uma mutação (ex: Deletar matéria), precisa avisar ao Next.js para limpar a página via `revalidatePath('/materias')`.

---

## 🏗️ A Nova Mentalidade: "Processar no Servidor, Consumir no Cliente"

A arquitetura evoluiu de múltiplos hooks independentes para um modelo de **Análise Centralizada**.

### 1. O Fim das "Queries Sinônimas" (Legacy vs New)
| Conceito | Abordagem Antiga (⚠️ DEPRECATED) | Abordagem Nova (✅ PADRÃO) |
| :--- | :--- | :--- |
| **Logs de Estudo** | `useStudyLogsRange`, `useSummaryStats`, `useCharts` | `useActivityAnalysis(start, end)` |
| **Dashboard** | `getDashboardDataAction` (Parallel Fetch) | `useDashboardData` (Client-side Composition) |
| **Metadados** | `getSubjectsTrees`, `getTopicsTree` (Server) | `useSubjectTree`, `useTopicsTree` (Client-side Build) |
| **Chaves** | Hardcoded strings `["subjects"]` | `metadataKeys`, `activityKeys` (Centralized) |

---

## 🛠️ Pilares da Implementação

### 1. Centralização em `useActivityAnalysis`
Toda informação baseada em tempo (logs, médias, totais de horas, dados de gráficos) deve vir deste hook único em `src/hooks/useActivity.ts`.
- **Por que?** O servidor busca os logs uma única vez e gera o resumo (`summary`) e os gráficos (`charts`) em uma única iteração.
- **Uso:** Se você precisa do total de horas de hoje, NÃO calcule no frontend. Use `data.summary.totalMinutes` retornado por este hook.
- **Hoje:** Use `useTodayActivity()` que garante estabilidade de key via `activityKeys.today()`.

### 2. Metadados e o Princípio de "Árvores Virtuais"
Matérias e Tópicos são considerados **Metadados Estáticos** (cache de 1h).
- **Fetch Flat**: Buscamos a lista "plana" de matérias e tópicos.
- **Build Client-side**: Hooks como `useSubjectTree` constroem a hierarquia em memória no cliente usando `useMemo`. 
- **Cache Compartilhado**: `useTopics()` e `useTopicsTree()` usam a **mesma query key** (`metadataKeys.topics`). A árvore é construída via `select`, não via query separada.
- **Benefício**: Evita queries recursivas no SQL e permite que qualquer mudança em um tópico invalide instantaneamente todas as árvores em todas as telas sem novas requisições.

### 3. Gerenciamento de Chaves (`src/lib/query-keys.ts`)
Nunca use strings puras em `useQuery`. Utilize as fábricas de chaves:
- `activityKeys.range(start, end)`: Para qualquer dado de histórico ou dashboard.
- `activityKeys.today()`: Para dados de hoje (key estável).
- `activityKeys.detail(id)`: Para detalhes de um log específico.
- `metadataKeys.subjects` / `metadataKeys.topics`: Para listas globais.

### 4. Defaults Globais Agressivos (`QueryProvider`)
O `QueryClient` em `src/app/providers/QueryProvider.tsx` configura defaults globais:
- `staleTime: 24 horas` — dados do dashboard não mudam sem ação do usuário
- `gcTime: 7 dias` — cache ultra agressivo para manter dados na memória
- `refetchOnMount: false` — **CRÍTICO**: componente monta = usa cache, sem fetch
- `refetchOnWindowFocus: false` / `refetchOnReconnect: false`
- `retry: 1`

> ⚠️ NÃO adicione `refetchOnWindowFocus: false` ou `refetchOnMount: false` em hooks individuais — já está no provider. Só sobrescreva se precisar de um valor DIFERENTE (ex: `refetchOnMount: true` para forçar refresh).

---

## 📋 Regras de Ouro para Desenvolvedores

1.  **NÃO crie novos Server Actions de "Get"** se os dados já existem no modelo de `HistoryAnalysis`. Se precisar de um novo gráfico, adicione a lógica de processamento em `src/server/actions/analysis.action.ts`.
2.  **Invalidação Precisa**: 
    - Ao criar/editar/deletar um **StudyLog**: invalide `activityKeys.all` + `["studyLogs"]`.
    - Ao criar/deletar um **Tópico**: invalide `topicsKeys.all` + `activityKeys.all`. **NÃO invalide subjects** (tópicos não afetam a lista de matérias).
    - Ao criar/editar/deletar uma **Matéria**: invalide `subjectsKeys.all`.
3.  **Derivação de Dados**: Se um componente precisa de um subconjunto de dados (ex: apenas o Ritmo Circadiano), use o hook centralizado e extraia a propriedade: 
    ```tsx
    const { data } = useDashboardData();
    const clock = data?.charts.biologicalClock;
    ```
4.  **Respeite o Cache Histórico**: Dados de datas passadas têm `staleTime: Infinity`. Eles nunca mudam a menos que um log antigo seja editado.
5.  **NÃO use keys inline**: Nunca escreva `queryKey: ["studyLogs", "details", id]` diretamente. Use `activityKeys.detail(id)`.
6.  **NÃO duplique queryFn em keys diferentes**: Se dois hooks chamam a mesma server action, eles DEVEM usar a mesma `queryKey` e diferenciar via `select`.

## 📂 Mapa de Responsabilidades
- `src/server/actions/analysis.action.ts`: O "Cérebro". Processa SQL e transforma em insights.
- `src/hooks/useActivity.ts`: O "Duto Principal". Gerencia o cache de atividades.
- `src/hooks/useDashboard.ts`: O "Compositor". Une Atividade + Matérias + Tópicos para a Home.
- `src/hooks/useSubjects.ts` & `useTopics.ts`: Gestores de Metadados e Construtores de Árvores.
- `src/app/providers/QueryProvider.tsx`: Configuração global de cache.

## ⚠️ Server Actions Deprecated
As seguintes actions estão marcadas como `@deprecated` e **NÃO devem ser usadas em código novo**:
- `getDashboardDataAction` — substituída por `useDashboardData` (composição de hooks)
- `getTodayStudyLogsAction` — substituída por `useTodayActivity`
- `getStudyLogsByDateAction` / `getStudyLogsByDateRangeAction` — substituídas por `getHistoryAnalysisAction`
- `getStudyLogsFeedAction` — não é usada por nenhum hook ativo
