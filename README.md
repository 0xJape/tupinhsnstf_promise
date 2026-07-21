# P.R.O.M.I.S.E.

PCOS Risk Observation, Monitoring, Intervention, Screening, and Education.

**Educational screening only — not a diagnosis.** Ages 12–24.

## Stack

- Next.js 16 App Router + TypeScript + Tailwind v4 + shadcn/ui
- Supabase (Auth / Postgres / RLS) — env required for auth
- Pure TS rule engine (`src/lib/rules/pcosScreen.ts`) + Vitest
- Vercel deploy target

Product docs: [`docs/`](./docs/).

## Setup

```bash
cp .env.example .env.local
# fill Supabase + AI keys when ready
npm install
npm run dev
```

Open http://localhost:3000

## Scripts

| Command | What |
| --- | --- |
| `npm run dev` | Dev server |
| `npm test` | Rule engine unit tests |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

## Routes (P0 shell)

- `/` landing
- `/login` `/register` `/consent` — auth UI stubs
- `/home` `/cycle` `/screen` `/assistant` `/profile` — app shell + bottom nav
- `POST /api/screening` — scores answers via pure rules (no DB yet)
- Other API routes return 501 until wired

## Notes

- Next 16: session refresh lives in `src/proxy.ts` (not `middleware.ts`)
- Mobile-first: shell `max-w-lg`, touch targets ≥44px
- Screening UI: grouped Yes/No pages (QuizGroup) — implement next

## Deploy to Vercel

1. Import GitHub repository in Vercel.
2. Add variables from `.env.example` under Project Settings → Environment Variables.
3. Set `NEXT_PUBLIC_APP_URL` to production URL.
4. Add production URL to Supabase Auth → URL Configuration.
5. Deploy with framework preset **Next.js** and default build command `npm run build`.
