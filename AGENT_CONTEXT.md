# 🤖 Agent Context: Monitor de Estudos

This is an optimized context file for LLMs and code agents to quickly understand the project architecture, tech stack, and critical rules.

## 🏗️ Tech Stack
- **Framework:** Next.js (App Router) + React 19
- **Database:** PostgreSQL (via Prisma ORM)
- **State Management:** Zustand (Client state), React Query (Server state fetching on client)
- **Styling:** Tailwind CSS, `lucide-react` icons, `shadcn/ui` based components.
- **Auth:** Better Auth (`@better-auth/prisma-adapter`)

## 📂 Core Architecture
- **Server Actions (`src/server/actions/`)**: We strictly use Server Actions for all database mutations and server-side data fetching. We do **not** use Next.js API Routes (`/api/...`) for internal business logic.
- **Caching (`unstable_cache`)**: Heavy read operations (like Profile and Dashboard stats) are wrapped in Next.js `unstable_cache`. 
  - **Rule:** Always use `revalidate` (TTL) and `tags` in caches. Invalidate via `revalidateTag` when mutations occur.
  - **Rule:** Do not wrap `unstable_cache(...)()` inline inside an action. Extract it to a named function to prevent memory leaks/closure recreation on every request.

## 🗄️ Database & Optimization Strategies
- **Hierarchy:** `Subject` (Matéria) -> `Topic` (Tópico, hierarchical using `ltree` extension) -> `StudyLogs` (Sessões de estudo).
- **Rollup Tables (CRITICAL):** We heavily optimize read paths to avoid scanning thousands of `StudyLogs`.
  - `UserStats`: Stores O(1) global stats (total minutes, streaks, study days).
  - `UserDailyStats`: Stores aggregated study minutes per day per user (used for Heatmaps and summary charts).
  - **Mutation Flow:** When a `StudyLog` is created/updated/deleted, it triggers `recomputeUserStats` which incrementally updates `UserDailyStats` and `UserStats` via batch `groupBy` operations. 
  - **Rule:** NEVER run queries inside a loop (e.g., `for (const d of dates) await prisma...`). Always use batch `groupBy` and `Promise.all` for upserts.

## 🎨 UI & Styling Rules
- **Color System:** Subjects (`Subject.color`) store pure Hex/RGB values (e.g., `#8b5cf6`), **NOT** Tailwind classes (like `bg-violet-500`). UI components map these hex values dynamically to `style={{ backgroundColor: color }}` or similar.
- **Theme:** The app has user themes (`midnight`, `sunset`, `sky`, etc.) managed via `next-themes`.
- **Components:** Favor desnormalized, skeletal loading states. 

## 🚀 Key Features
- **Profile:** Public/private profiles with stats, heatmaps, badges, and followers.
- **History (Histórico):** Uses `UserDailyStats` for the heatmap and summary, and `StudyLogs` for the detailed timeline and area/pie charts.
- **Planner (Planejador):** Allows users to define study hour goals per subject per week, structured as 1-hour blocks that can be dragged into a weekly schedule.

## 🛑 Strict Restrictions
- **Production DB:** Do not run Prisma migrations or `db push` blindly without user consent, as it affects the production schema.
- **N+1 Queries:** Always use `include` in Prisma or `Promise.all` for parallel fetching. Never fetch relational data sequentially in loops.
