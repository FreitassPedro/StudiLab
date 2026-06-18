# Arquitetura de Data Fetching e Cache (V2 - Centralizada)

Este documento define a arquitetura final de busca de dados, projetada para máxima performance (Single-Pass Server Processing) e economia de banco de dados.

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

### 2. Metadados e o Princípio de "Árvores Virtuais"
Matérias e Tópicos são considerados **Metadados Estáticos** (cache de 1h).
- **Fetch Flat**: Buscamos a lista "plana" de matérias e tópicos.
- **Build Client-side**: Hooks como `useSubjectTree` constroem a hierarquia em memória no cliente usando `useMemo`. 
- **Benefício**: Evita queries recursivas no SQL e permite que qualquer mudança em um tópico invalide instantaneamente todas as árvores em todas as telas sem novas requisições.

### 3. Gerenciamento de Chaves (`src/lib/query-keys.ts`)
Nunca use strings puras em `useQuery`. Utilize as fábricas de chaves:
- `activityKeys.range(start, end)`: Para qualquer dado de histórico ou dashboard.
- `metadataKeys.subjects` / `metadataKeys.topics`: Para listas globais.

---

## 📋 Regras de Ouro para Desenvolvedores

1.  **NÃO crie novos Server Actions de "Get"** se os dados já existem no modelo de `HistoryAnalysis`. Se precisar de um novo gráfico, adicione a lógica de processamento em `src/server/actions/analysis.action.ts`.
2.  **Invalidação em Cascata**: Ao criar/deletar um Tópico, você DEVE invalidar `metadataKeys.topics` (para atualizar a lista) E `activityKeys.all` (para atualizar os gráficos que dependem daquele tópico).
3.  **Derivação de Dados**: Se um componente precisa de um subconjunto de dados (ex: apenas o Ritmo Circadiano), use o hook centralizado e extraia a propriedade: 
    ```tsx
    const { data } = useDashboardData();
    const clock = data?.charts.biologicalClock;
    ```
4.  **Respeite o Cache Histórico**: Dados de datas passadas têm `staleTime: Infinity`. Eles nunca mudam a menos que um log antigo seja editado.

## 📂 Mapa de Responsabilidades
- `src/server/actions/analysis.action.ts`: O "Cérebro". Processa SQL e transforma em insights.
- `src/hooks/useActivity.ts`: O "Duto Principal". Gerencia o cache de atividades.
- `src/hooks/useDashboard.ts`: O "Compositor". Une Atividade + Matérias + Tópicos para a Home.
- `src/hooks/useSubjects.ts` & `useTopics.ts`: Gestores de Metadados e Construtores de Árvores.
