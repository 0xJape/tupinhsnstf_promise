# P.R.O.M.I.S.E.

**PCOS Risk Observation, Monitoring, Intervention, Screening, and Education**

P.R.O.M.I.S.E. is a mobile-first responsive web application for educational PCOS-risk screening and menstrual-health support for users ages 12–24. It helps users record health information, understand patterns, receive explainable screening results, and prepare for professional consultation.

> **Medical boundary:** P.R.O.M.I.S.E. is not a diagnostic tool. It does not confirm PCOS, replace a clinician, prescribe medication, or provide emergency care.

## What system does

### Participant features

- **Account, consent, and age gate** — registration limits target population to ages 12–24; required non-diagnosis, health-data, AI, and notification consents are recorded.
- **Forced onboarding** — collects baseline profile, physical measurements, family history, medical history, medications, lifestyle, and notification preferences before app access.
- **Home dashboard** — central entry point for latest screening, cycle activity, insights, reminders, and educational actions.
- **Menstrual tracking** — records period start date, duration, flow, pain, notes, and related symptoms. Cycle logic calculates available cycle length, irregularity indicators, and simple predictions from stored dates.
- **PCOS-risk screening** — grouped mobile questionnaire. Server-side TypeScript rules calculate score, category, contributing factors, referral recommendation, and rule version.
- **Explainable results** — result pages show why factors contributed. Same inputs produce reproducible results; AI does not calculate or change score.
- **Referral support** — Moderate and High results show consultation guidance, reasons, visit-preparation checklist, and optional AI explanation.
- **AI health assistant** — provides plain-language education, result explanations, menstrual-health information, and supportive lifestyle guidance using minimized user context.
- **Voice support** — AI speech endpoints support transcription and text-to-speech where configured.
- **Photo symptom assessment** — server route supports vision-assisted photo observations. This remains separate from deterministic screening and must not be presented as diagnosis.
- **Profile and notification settings** — users can update baseline information, consent visibility, contact details, and notification preferences.
- **Help and safety content** — explains product limits and directs urgent concerns to appropriate professional or emergency services.

### Admin and operations features

- Admin dashboard with participant and referral views.
- Participant detail and operational review screens.
- Referral request workflow and status management.
- Screening correction-request endpoint for data-quality operations.
- Demo reset endpoint for controlled presentations and testing.
- Research/admin access is constrained by Supabase roles and row-level security policies.

## Main user flow

```text
Landing
	→ Register or log in
	→ Age eligibility check
	→ Required consent
	→ Forced onboarding
	→ Home dashboard
			├─ Log menstrual cycle and symptoms
			├─ Run PCOS-risk screening
			│    ├─ Low: education and monitoring guidance
			│    └─ Moderate/High: referral checklist and optional AI explanation
			├─ Ask AI health assistant
			├─ Review profile and notification settings
			└─ Read help and safety guidance
```

### Screening flow

```text
Quiz answers
	→ POST /api/screening
	→ Validate request
	→ Load authenticated profile
	→ Pure TypeScript rule engine
	→ Save assessment snapshot
	→ Optional elevated-risk notification event
	→ Result, contributing factors, disclaimer, referral support
```

### AI flow

```text
User question or result explanation
	→ Authenticated Next.js route
	→ Minimized health context
	→ Groq provider
	→ Safe fallback/template if unavailable
	→ Store conversation when enabled
	→ Display educational response and safety boundary
```

## Technology stack and system role

| Technology | Role in system |
| --- | --- |
| Next.js 16 App Router | UI routes, layouts, server rendering, route handlers, and deployment unit |
| React 19 | Interactive screens and client components |
| TypeScript | Application code, data contracts, rule engine, and safer server boundaries |
| Tailwind CSS v4 | Mobile-first styling and responsive layout |
| shadcn/ui and Base UI | Accessible UI primitives, forms, dialogs, navigation, and feedback |
| React Hook Form + Zod | Form state and input validation |
| Supabase Auth | Email/password authentication and session cookies |
| Supabase Postgres | Profiles, consent, cycle logs, symptoms, assessments, conversations, referrals, and notification data |
| Supabase RLS | Per-user data isolation and role-based database access |
| Pure TypeScript rules | Deterministic BMI, symptom, cycle, risk-category, and referral logic |
| Groq | Primary server-side AI chat, transcription, speech, and vision provider where configured |
| Gemini | Planned/optional fallback provider documented in architecture decisions |
| Make.com | Webhook-based email/SMS reminders and follow-up automation |
| Vercel | Production hosting target and cron execution target |
| Vitest | Unit tests for rules and cycle calculations |
| ESLint | Static code-quality checks |
| date-fns | Date and cycle calculations |
| lucide-react, GSAP, Sonner | Icons, selected motion, and toast feedback |

## Architecture

```text
Mobile browser
		│ HTTPS
		▼
Next.js 16 on Vercel
		├─ App Router pages and components
		├─ Auth/session proxy
		├─ Server actions and API route handlers
		├─ Pure rules and cycle libraries
		├─ AI provider adapters
		└─ Make.com event emitter
			 │              │             │
			 ▼              ▼             ▼
Supabase        Groq/Gemini     Make.com
Auth/Postgres   server-only AI  email/SMS workflows
RLS             explain/educate  reminders/follow-ups
```

Layer responsibilities stay separate:

- UI collects input and displays results.
- Rules calculate screening output.
- AI explains and educates; it does not score or diagnose.
- Supabase is source of truth for application data.
- Make.com delivers notifications; it is not clinical storage.
- Secrets stay server-side and out of browser bundles.

## Repository map

```text
src/app/                 Pages, layouts, API routes, and route groups
src/components/          Feature and shared UI components
src/lib/rules/            Deterministic PCOS screening rules
src/lib/cycle/            Menstrual date and cycle calculations
src/lib/ai/               Groq, vision, prompts, context, and fallbacks
src/lib/make/             Notification event emission
src/lib/supabase/         Browser, server, admin, and session clients
src/lib/validations/      Shared validation logic
src/types/                Application data contracts
supabase/migrations/      Postgres schema, RLS, admin, referral, and photo changes
docs/                     Product, UX, safety, data, and implementation decisions
public/                   Brand and Promi assets
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Public landing page |
| `/login`, `/register`, `/consent` | Authentication and consent |
| `/onboarding/[step]` | Required profile wizard |
| `/home` | Participant dashboard |
| `/cycle`, `/cycle/new`, `/cycle/[id]/edit` | Menstrual logs and editing |
| `/screen`, `/screen/quiz` | Screening intro and questionnaire |
| `/screen/result/[id]` | Screening result and referral support |
| `/screen/result/[id]/summary` | Result summary |
| `/assistant`, `/assistant/[conversationId]` | AI assistant |
| `/profile`, `/profile/notifications` | Profile and notification preferences |
| `/help` | Safety and product guidance |
| `/admin` and subroutes | Protected research/admin operations |

### API routes

| Endpoint | Purpose |
| --- | --- |
| `POST /api/screening` | Validate and score screening submission |
| `POST /api/ai/chat` | AI educational chat and result explanation |
| `POST /api/ai/transcribe` | Speech-to-text through configured AI provider |
| `POST /api/ai/speak` | Text-to-speech through configured AI provider |
| `POST /api/screening/photo-assessment` | Vision-assisted photo observation |
| `POST /api/referrals/request` | Create referral-support request |
| `POST /api/screening/correction-request` | Submit screening correction request |
| `POST /api/notifications/emit` | Emit authenticated/internal Make event |
| `GET /api/cron/reminders` | Process scheduled reminders with cron secret |
| `POST /api/demo/reset` | Reset demo data through protected admin path |

## Local development

### Requirements

- Node.js compatible with project Next.js version
- npm
- Supabase project for auth/database features
- Optional Groq and Make.com credentials for AI and notification flows

### Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Apply Supabase migrations from `supabase/migrations/` in migration order. Do not use production credentials for local development.

### Environment variables

Create `.env.local`. Never commit it.

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
GROQ_MODEL=
GROQ_VISION_API_KEY=
GROQ_VISION_MODEL=
GROQ_TTS_MODEL=
GROQ_TTS_VOICE=
GEMINI_API_KEY=
AI_TIMEOUT_MS=12000
AI_VISION_TIMEOUT_MS=45000
MAKE_WEBHOOK_URL=
MAKE_WEBHOOK_SECRET=
CRON_SECRET=
CARE_DESK_EMAIL=
CARE_DESK_PHONE=
NEXT_PUBLIC_APP_URL=http://localhost:3000
CONSENT_POLICY_VERSION=consent-v1
RULE_VERSION=pcos-screen-v1
```

Supabase publishable/anon key is client-safe. `SUPABASE_SERVICE_ROLE_KEY`, AI keys, Make secrets, and cron secrets are server-only.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Start production server after build |
| `npm test` | Run Vitest tests |
| `npm run lint` | Run ESLint |

Recommended check before commit:

```bash
npm test
npm run lint
npm run build
```

## Security, privacy, and safety

- Health features require authentication.
- Supabase RLS limits participant data to its owner and authorized roles.
- AI receives minimized context rather than unrestricted database access.
- AI cannot author the deterministic risk score.
- Every risk and AI surface must retain non-diagnosis language.
- Consent version is stored so policy changes can be tracked.
- Demo data must be fictional and isolated from participant data.
- Do not place service-role keys or provider keys in client components.
- Do not treat generated text or photo observations as clinical diagnosis.

## Current scope and planned work

Implemented routes and migrations show the working foundation: authentication/onboarding surfaces, cycle tracking, screening/result flows, AI endpoints, referrals, notifications, photo-assessment support, and admin operations.

Some product documents describe future or optional behavior. Confirm implementation before claiming these as complete:

- Gemini fallback provider wiring
- Full Make.com scenarios and external SMS provider setup
- Production Vercel cron configuration
- Native mobile apps and offline logging
- Full clinician portal
- Clinical-grade dermatology computer vision
- Formal clinical validation or diagnostic use

## Documentation

Product and engineering decisions live in [`docs/`](./docs/):

- [MVP scope](./docs/01-mvp-scope.md)
- [Users and compliance](./docs/02-users-compliance.md)
- [User journeys](./docs/03-user-journeys.md)
- [Rule engine](./docs/04-rule-engine.md)
- [Data model](./docs/05-data-model.md)
- [Technology and architecture](./docs/06-tech-stack.md)
- [AI guardrails](./docs/07-ai-guardrails.md)
- [Clinical content](./docs/08-clinical-content.md)
- [UX and information architecture](./docs/09-ux-ia.md)
- [Website components](./docs/11-website-components.md)
- [Make.com workflow](./docs/12-make-com-workflow.md)
- [Promi modal triggers](./docs/13-promi-modal-triggers.md)
- [Admin operations](./docs/14-admin-operations-guide.md)

## Deployment

1. Push repository to GitHub.
2. Import repository into Vercel using Next.js preset.
3. Add production environment variables in Vercel.
4. Apply Supabase migrations to target project.
5. Add production app URL to Supabase Auth URL configuration.
6. Configure Make.com webhook and cron secret if notifications are enabled.
7. Run `npm run build` before release.

Keep participant/research data and demo data in separate environments where possible.
