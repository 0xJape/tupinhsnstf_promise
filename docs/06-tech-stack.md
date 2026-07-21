# 06 — Tech Stack & System Architecture

**Status:** Decisions locked — implement next  
**Last updated:** 2026-07-13  
**Depends on:** `01`–`05`  
**Pairs with:** `11-website-components.md` (UI building blocks)

---

## 1. Stack summary (LOCKED)

| Layer | Choice | Why |
|-------|--------|-----|
| App type | **Responsive web app (mobile-first)** | Capstone product is the phone experience; desktop is secondary |
| Frontend | **Next.js 15 (App Router) + TypeScript + Tailwind CSS** | Routes, SSR, API routes, fast MVP |
| UI kit | **shadcn/ui + Radix primitives** | Accessible forms, dialogs, tabs |
| Forms | **React Hook Form + Zod** | Validation shared client/server |
| Backend / DB / Auth | **Supabase** (Postgres + Auth + RLS) — **LOCKED** | SQL snapshots, isolation, free tier |
| Rule engine | **Pure TypeScript** (`lib/rules`) + **server-side** scoring | Testable; AI never scores |
| AI | **Groq primary · Gemini fallback** | Fast explain; safe fallback |
| Automation | **Make.com** webhooks | Email + SMS |
| Hosting | **Vercel** + Supabase Cloud — **LOCKED** | Capstone deploy target |
| Tests | **Vitest** (rules/cycle) · optional Playwright | Correctness for defense |


---

## 1.1 Mobile-first implementation rules (LOCKED)

This web app **is** the capstone deliverable — not a desktop prototype later squeezed onto phones.

| Rule | Practice |
|------|----------|
| Design order | **360–430px first**, then scale up |
| QA order | Phone Chrome/Safari first; desktop last |
| Layout | Single column; app shell `max-w-lg` centered on large screens |
| Touch | Primary controls ≥ 44px; large Yes/No on screening |
| Nav | Bottom tab bar (thumb zone); no hover-only actions |
| Forms | One focused task per step (onboarding); screening may **group ≈3–4 questions** per page |
| Type | Readable body ≥ 16px on inputs where possible (reduce iOS zoom pain) |
| Performance | Keep quiz/result snappy on mid-range Android |
| Desktop | Usable, not primary; no features that only work with mouse hover |

---

## 2. System architecture (big picture)

```text
┌─────────────────────────────────────────────────────────────┐
│  Browser (phone-first Next.js UI)                           │
│  Landing · Auth · Onboarding · Home · Cycle · Screen · AI   │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────────┐
│  Next.js (Vercel)                                           │
│  • App Router pages (RSC + client components)               │
│  • Middleware (session + onboarding gate)                   │
│  • Server Actions / Route Handlers                          │
│  • lib/rules  · lib/cycle  · lib/ai  · lib/make             │
└───────┬───────────────────┬───────────────────┬─────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────────┐
│ Supabase      │   │ Groq / Gemini │   │ Make.com          │
│ Auth + Postgres│   │ (server only) │   │ Email + SMS       │
│ RLS per user  │   │ explain only  │   │ webhooks + cron   │
└───────────────┘   └───────────────┘   └───────────────────┘
```

### Layer rules (non-negotiable)

| Layer | Does | Does not |
|-------|------|----------|
| UI | Collect input, show results, CTAs | Own secrets, invent risk score |
| Rules (`pcos-screen-v1`) | Score, category, referral flag | Chat or diagnose |
| AI | Explain + educate | Change score / prescribe |
| Make.com | Deliver notifications | Store clinical source of truth |
| Supabase | Auth, data, RLS | Run LLM |

---

## 3. Repository / folder structure

Single Next.js app at repo root (or `apps/web` if you later monorepo — **MVP = root**).

```text
promise/
├── docs/                          # foundation docs (this set)
├── CONTEXT.md
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.local                     # never commit
├── .env.example
├── supabase/
│   ├── migrations/                # SQL schema + RLS
│   └── seed.sql                   # demo user data
├── src/
│   ├── app/
│   │   ├── layout.tsx             # root layout, fonts
│   │   ├── page.tsx               # landing
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── consent/page.tsx
│   │   ├── (app)/                 # authenticated shell + bottom nav
│   │   │   ├── layout.tsx
│   │   │   ├── home/page.tsx
│   │   │   ├── cycle/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── screen/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── quiz/page.tsx
│   │   │   │   └── result/[id]/page.tsx
│   │   │   ├── assistant/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [conversationId]/page.tsx
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx
│   │   │   │   └── notifications/page.tsx
│   │   │   ├── onboarding/[step]/page.tsx
│   │   │   └── help/page.tsx
│   │   ├── api/
│   │   │   ├── ai/chat/route.ts
│   │   │   ├── screening/route.ts
│   │   │   ├── notifications/emit/route.ts
│   │   │   ├── cron/reminders/route.ts
│   │   │   └── demo/reset/route.ts
│   │   └── globals.css
│   ├── components/                # see 11-website-components.md
│   │   ├── ui/                    # shadcn primitives
│   │   ├── layout/
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── cycle/
│   │   ├── screening/
│   │   ├── assistant/
│   │   ├── profile/
│   │   └── shared/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # browser
│   │   │   ├── server.ts          # RSC / actions
│   │   │   └── admin.ts           # service role (seed/reset only)
│   │   ├── rules/
│   │   │   ├── pcosScreen.ts
│   │   │   └── pcosScreen.test.ts
│   │   ├── cycle/
│   │   │   ├── math.ts
│   │   │   └── math.test.ts
│   │   ├── ai/
│   │   │   ├── provider.ts        # groq → gemini → template
│   │   │   ├── prompts.ts         # ai-guard-v1
│   │   │   └── context.ts         # minimize payload
│   │   ├── make/
│   │   │   └── client.ts
│   │   ├── validations/           # zod schemas
│   │   └── utils.ts
│   ├── types/
│   │   ├── database.ts            # generated or hand types
│   │   ├── screening.ts
│   │   └── cycle.ts
│   └── middleware.ts              # auth + onboarding gate
└── public/
    └── brand/                     # logo, icons
```

---

## 4. Route map (app ↔ product)

| Route | Auth | Onboarding | Purpose |
|-------|------|------------|---------|
| `/` | Public | — | Landing |
| `/login` `/register` | Public | — | Auth |
| `/consent` | User | Before/with onboarding | Consents |
| `/onboarding/[step]` | User | Incomplete only | Forced wizard |
| `/home` | User | Complete | Dashboard |
| `/cycle` … | User | Complete | Logs + insights |
| `/screen` … | User | Complete | Quiz + results |
| `/assistant` … | User | Complete | AI chat |
| `/profile` … | User | Complete | Account + prefs |
| `/help` | User | Optional | Disclaimers / urgent care |
| `/api/*` | Session or cron secret | — | Server APIs |

**Middleware rules**
1. No session → only public routes  
2. Session + no consent / incomplete onboarding → force `/consent` or `/onboarding/*`  
3. Onboarded user hitting onboarding → redirect `/home`  
4. Age ineligible → block with message (from register)

---

## 5. API / server surface

Prefer **Server Actions** for form CRUD; use **Route Handlers** for AI, cron, webhooks.

| Endpoint / action | Method | Responsibility |
|-------------------|--------|----------------|
| `createMenstrualLog` | Server Action | Insert log; recompute insights |
| `updateProfileStep` | Server Action | Onboarding patches |
| `POST /api/screening` | Route | Validate answers → `scoreAssessment` → save snapshot → optional Make.com elevated follow-up |
| `POST /api/ai/chat` | Route | Build context → Groq/Gemini → store messages |
| `POST /api/notifications/emit` | Route | Internal/server; call Make.com |
| `GET /api/cron/reminders` | Cron | Daily due reminders (Vercel Cron + `CRON_SECRET`) |
| `POST /api/demo/reset` | Route | Service role; demo rows only |

### Screening request/response (contract)

```ts
// POST /api/screening
Request: {
  answers: Record<QuestionId, boolean>
}
Response: {
  assessmentId: string
  ruleVersion: "pcos-screen-v1"
  totalScore: number
  category: "Low" | "Moderate" | "High"
  contributingFactors: { id: string; label: string; points: number }[]
  referralRecommended: boolean
  bmi: number
}
```

### AI chat contract

```ts
// POST /api/ai/chat
Request: {
  conversationId?: string
  message: string
  relatedAssessmentId?: string
}
Response: {
  conversationId: string
  assistantMessage: string
  model: string  // e.g. "groq:llama-3.3" | "gemini:flash" | "template"
}
```

---

## 6. Auth & session (Supabase + Next.js)

| Concern | Approach |
|---------|----------|
| Provider | Supabase Auth email/password |
| Browser client | `@supabase/ssr` browser client |
| Server | `@supabase/ssr` server client (cookies) |
| Middleware | Refresh session; gate routes |
| Profile row | Created on first login / register trigger or app upsert |
| Passwords | Never stored in app tables; never sent to AI/Make |

---

## 7. Data & security (tech view)

| Rule | Implementation |
|------|----------------|
| Account isolation | RLS: `user_id = auth.uid()` on all health tables |
| Scoring integrity | Score only on server with `pcosScreen.ts` |
| Secrets | Env on Vercel/server only |
| Demo | `profiles.is_demo = true`; reset via service role |
| AI payload | Minimized context (`lib/ai/context.ts`) |
| Make.com | Shared secret header; minimal template fields |

Full schema: `05-data-model.md`.

---

## 8. Rule engine integration

```text
UI quiz answers
    → POST /api/screening
        → load profile (BMI, family flags if needed)
        → scoreAssessment(profile, answers)  // pure TS
        → insert risk_assessments snapshot
        → if Moderate/High && prefs: emit Make.com elevated_risk_followup
        → return result DTO to Result screen
```

- Unit tests: cases T1–T6 in `04-rule-engine.md`  
- `ruleVersion` always stored  
- Client may preview score for UX **only if** server re-validates (prefer server-only)

---

## 9. AI provider strategy (implementation)

```text
try Groq (timeout ~12s)
  → on fail/timeout: try Gemini once
    → on fail: static template from 07-ai-guardrails.md
```

| Env | Purpose |
|-----|---------|
| `GROQ_API_KEY` | Primary |
| `GEMINI_API_KEY` | Fallback |
| `AI_PRIMARY` | `groq` |
| `AI_FALLBACK` | `gemini` |
| `AI_TIMEOUT_MS` | e.g. `12000` |

System prompt version: `ai-guard-v1` in `lib/ai/prompts.ts` (source: `07`).

---

## 10. Make.com wiring

### Events (MVP)

| `eventType` | Trigger |
|-------------|---------|
| `period_reminder` | Cron: predicted window near |
| `missed_tracking_reminder` | Cron: no log beyond threshold |
| `elevated_risk_followup` | After Moderate/High screening |
| `weekly_education` | Optional cron |

### Env

```text
MAKE_WEBHOOK_URL=
MAKE_WEBHOOK_SECRET=
CRON_SECRET=
```

### Payload shape

See `05-data-model.md` §8. App is source of truth; Make only delivers.

---

## 11. Environment variables (full list)

```text
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server only: seed/reset

# AI
GROQ_API_KEY=
GEMINI_API_KEY=
AI_PRIMARY=groq
AI_FALLBACK=gemini
AI_TIMEOUT_MS=12000

# Make.com + cron
MAKE_WEBHOOK_URL=
MAKE_WEBHOOK_SECRET=
CRON_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CONSENT_POLICY_VERSION=consent-v1
RULE_VERSION=pcos-screen-v1
```

Ship `.env.example` with empty values; never commit `.env.local`.

---

## 12. Hosting & environments

| Env | Frontend | Database | Notes |
|-----|----------|----------|-------|
| local | `next dev` | Supabase local or cloud dev project | Daily work |
| production | Vercel | Supabase project | Demo + study |

Optional staging project if time allows. Prefer separate Supabase for real participants vs public demo.

---

## 13. Tooling & scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local app |
| `npm run build` | Production build |
| `npm run test` | Vitest (rules + cycle) |
| `npm run lint` | ESLint |
| `npx shadcn@latest add …` | UI primitives |

---

## 14. Implementation order (engineering)

1. Scaffold Next.js + Tailwind + shadcn + folder layout  
2. Supabase project, migrations, RLS, auth pages  
3. Middleware gates + profile bootstrap  
4. Onboarding wizard (forced)  
5. Menstrual logs + cycle math + tests  
6. Rule engine + screening API + result/referral UI  
7. AI chat API + guardrails + fallback  
8. Notification prefs + Make.com + cron  
9. Demo seed/reset  
10. Deploy Vercel + defense dry run  

UI component build order: `11-website-components.md` § build priority.

---

## 15. Third parties (disclose in consent)

Supabase · Vercel · Groq · Google Gemini · Make.com · Email/SMS provider inside Make

---

## 16. Alternatives considered

| Option | Verdict |
|--------|---------|
| Flutter / React Native | Out — web decided |
| Firebase | OK alt; SQL snapshots better in Supabase |
| Custom Nest + Postgres | Extra ops for capstone |
| Client-side LLM keys | **Never** |

---

## 17. Open items

**Locked:** Supabase + Vercel + mobile-first. Screening: **grouped quiz OK** (see `11`).

| ID | Topic | Default |
|----|--------|---------|
| T1 | Exact Groq / Gemini model IDs | Pin at build time |
| T2 | SMS gateway in Make | Twilio or PH-friendly |
| T3 | Supabase region | Closest practical to PH |
| T4 | Domain name | TBD |
| T5 | Supabase local vs cloud-only for dev | Cloud dev OK for speed |
| T6 | Mobile QA devices | Real phone + DevTools device mode |

---

## 18. Related docs

| Doc | Role |
|-----|------|
| `05-data-model.md` | Tables, RLS, payloads |
| `04-rule-engine.md` | Scoring logic |
| `07-ai-guardrails.md` | Prompt + safety |
| `09-ux-ia.md` | Screens & IA |
| **`11-website-components.md`** | **Component catalog & props** |

---

## Next

Review this stack, then `11-website-components.md` for every UI building block mapped to routes.

