# Monitor de Estudos - Contexto para Agentes de IA

Este arquivo contém o contexto central do projeto para orientar agentes de IA durante a manutenção e evolução do código, economizando tokens e evitando alucinações. 

## 🛠 Tech Stack
- **Framework**: Next.js (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + `shadcn/ui`
- **Ícones**: `lucide-react`
- **Gerenciamento de Estado Global**: `zustand` (principalmente para o cronômetro)
- **Data Fetching e Cache no Cliente**: `@tanstack/react-query`
- **Banco de Dados & ORM**: Prisma 
- **Formulários**: `react-hook-form` + `@hookform/resolvers/zod`
- **Manipulação de Datas**: `date-fns`

## 🏗 Arquitetura e Padrões

1. **Server Actions (`src/server/actions/`)**: 
   - Toda comunicação direta com o Prisma (operações de CRUD) **deve** ser feita através de Server Actions.
   - Use `await requireAuth()` nas actions para garantir que apenas usuários logados acessem/mutem os dados.
   - Ao fazer uma mutação que altere dados exibidos em Server Components (ex: Dashboard), lembre-se de usar `revalidatePath('caminho')` do `next/cache`.

2. **React Query (`src/hooks/`)**:
   - Para Data Fetching em **Client Components**, utilizamos o React Query encapsulando as Server Actions.
   - Os hooks (ex: `useStudyLogs`, `useSubjects`) gerenciam o staleTime e o cache para gráficos e relatórios, melhorando a responsividade.
   - As mutations invalidam as chaves no `queryClient` (verifique `src/lib/query-keys.ts`).

3. **Gerenciamento de Estado (`src/store/`)**:
   - `zustand` é usado para estados globais do lado do cliente que requerem alta reatividade e desacoplamento (como o `useCronometerStore`).

4. **Componentes UI (`src/components/ui/`)**:
   - Componentes baseados no Radix UI via `shadcn/ui`. Sempre verifique se o componente base já existe antes de criá-lo do zero. Modificações neles devem ser mínimas; crie componentes estendidos fora dessa pasta quando precisar de lógica específica do app.

5. **Lidando com Datas e Fuso Horário**:
   - Cuidado especial com os fusos horários. Em operações de exibição local, use os helpers definidos em `src/lib/utils.ts` (como `getTodayLocal`, `formatDateToLocal`).

## 🚀 Estratégia de Cache e Performance

Para lidar com consultas massivas (ex: logs de meses) que são consumidas simultaneamente no Dashboard (Client-side) e Perfis de Usuários (Server-side), o projeto implementa uma arquitetura de cache de 3 camadas:

1. **Next.js Data Cache (`unstable_cache`) com Invalidação por Tags**:
   - As funções pesadas que geram estatísticas (`analysis.action.ts` e `profile.action.ts`) são protegidas por `unstable_cache`. Elas possuem tags como `study-logs-[userId]` e `profile-stats-[userId]`.
   - Se o usuário navegar por semanas ou meses passados, o cálculo é feito **uma única vez** pelo BD/Servidor e fica salvo na memória (JSON cacheado). Visitas subsequentes (de si mesmo ou terceiros) consomem 0 operações de DB.

2. **On-Demand Revalidation (`revalidateTag`)**:
   - Sempre que um usuário altera dados do **dia atual** (Criar/Editar/Deletar log em `studyLogs.action.ts`), invoca-se o `revalidateTag` para limpar imediatamente a memória apenas dos dados dele.
   - Na próxima requisição, o servidor busca tudo de novo e gera um novo cache consolidado. Isso elimina a complexidade de mesclar o "cache do mês vs dados de hoje" manualmente.

3. **Request Memoization (`cache()` do React)**:
   - Funções chamadas por Server Components (ex: metadados básicos como `getSubjectsAction`, `getTopicsAction`, e sessão do usuário com `getCurrentUser`) estão protegidas pelo `cache()` do React.
   - Isso evita chamadas idênticas ao banco de dados no mesmo ciclo de renderização.

4. **Client Cache (TanStack Query)**:
   - Os hooks na pasta `src/hooks` continuam controlando a experiência do cliente e os tempos de `staleTime`. Porém, mesmo quando o React Query acha que os dados estão "stale" e faz um refetch silencioso no fundo, **o Servidor responde em ms através do `unstable_cache`**, sem bater no banco de dados.

## 📁 Estrutura de Diretórios Importante

- `src/app/(protected)/`: Rotas acessíveis apenas para usuários autenticados (Dashboard, Histórico, Matérias, Nova Sessão).
- `src/server/actions/`: Funções executadas no servidor (Server Actions). Conectam-se ao Prisma.
- `src/hooks/`: Hooks customizados para queries e mutations do React Query.
- `src/schemas/`: Validação Zod para formulários e APIs.
- `prisma/schema.prisma`: Onde as entidades principais estão definidas (StudyLogs, Subjects, Topics).

---

# TODO Original do Projeto

## Pagina Inicial
- [ ] Criar landing page

## Dashboard
- [ ] Implementar "retomar sessão" carregando dados do último.
- [ ] Criar sistema de pausas, cronometrando e identificando com tags (Ex: #banheiro, #descanso)

## Segurança
- [ ] Implementar sistema de login (simplificado) solicitando um PIN de acesso ao usuário

## /Perfil
- [ ] Criar página de perfil do usuário

## Layout
- [ ] Ajustar cores do modo dark (padronizar card, bg, primary, secondary, muted).

## /Agenda
- [ ] Presets (1, 2, 3...) para rotinas
- [ ] Botão "Limpar tudo"
- [ ] Arrumar sidebar
- [ ] Deixar visualização colorida mas menos poluida

## /Nova-sessão
- [ ] Aumentar opções de métodos de estudos, permitindo o usuário criar um próprio (simulado, flashcard...) 

## Estatísticas
- [ ] Reduzir tamanho de cards

## Matérias
- [ ] Adicionar campo "isExpandido" e expandir conforme usuário selecionar
- [ ] Arquivar matéria para não mostrar

## Geral
- [ ] Criar ferramentas de Tasks
- [ ] Criar calendário de provas

## Sugestões dos Issues (GitHub)
- [ ] (#1) Criar página de perfil
- [ ] (#2) Filtro de pesquisa para logs de estudo
- [ ] (#3) Permitir agrupamento hierárquico e movimentação livre dos tópicos
- [ ] (#4) Sistema de pausas catalogadas
- [ ] (#5) Exportar StudyLogs para Google Calendar
- [ ] (#9) Adicionar botão de retomar estudos
- [ ] (#10) Criar labels rápidas na descrição do formulário
- [ ] (#13) Exibir card flutuante de estudo em andamento em todas as páginas
- [ ] (#16) Conectar Spotify no perfil