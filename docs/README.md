# P.R.O.M.I.S.E. — Foundation Docs

These documents define product and technical decisions **before development**.  
Each file is a single decision area so the team can review, revise, and implement without ambiguity.

## Reading order

| # | File | Status | Purpose |
|---|------|--------|---------|
| 01 | [01-mvp-scope.md](./01-mvp-scope.md) | Decisions captured | What is in / out of MVP |
| 02 | [02-users-compliance.md](./02-users-compliance.md) | Decisions captured | Age range, consent, privacy, PH capstone research |
| 03 | [03-user-journeys.md](./03-user-journeys.md) | Decisions captured | Core end-to-end flows + demo mode |
| 04 | [04-rule-engine.md](./04-rule-engine.md) | Draft v1 — review | Screening items, weights, thresholds, referral |
| 05 | [05-data-model.md](./05-data-model.md) | Draft v1 — review | Entities, RLS, auth, payloads |
| 06 | [06-tech-stack.md](./06-tech-stack.md) | Draft v1 — **tech deep dive** | Architecture, folders, APIs, env, deploy |
| 07 | [07-ai-guardrails.md](./07-ai-guardrails.md) | Draft v1 — review | Prompt rules, safety, fallback |
| 08 | [08-clinical-content.md](./08-clinical-content.md) | Draft v1 — review | Disclaimers, education, SMS/email copy |
| 09 | [09-ux-ia.md](./09-ux-ia.md) | Draft v1 — review | Screens, nav, wireframe-level IA |
| 10 | [10-success-metrics.md](./10-success-metrics.md) | Draft v1 — review | DoD, pilot metrics, milestones |
| 11 | [11-website-components.md](./11-website-components.md) | Draft v1 — **UI catalog** | Components, props, screen map, build order |
| 12 | [12-make-com-workflow.md](./12-make-com-workflow.md) | Implementation guide | Make.com webhook, events, cron, copy, smoke tests |
| 13 | [13-promi-modal-triggers.md](./13-promi-modal-triggers.md) | Implementation guide | Promi modal priority, trigger matrix, and manual tests |
| 14 | [14-admin-operations-guide.md](./14-admin-operations-guide.md) | Proposed implementation guide | Admin roles, dashboards, participant operations, referrals, corrections, security, and audit |

## Locked product snapshot

- **Form:** responsive web app (**mobile-first** = primary product experience)  
- **Type:** Philippines capstone research project  
- **Users:** females 12–24  
- **Deploy:** **Supabase** + **Vercel** (locked)
- **Screening UI:** **grouped pages OK** (≈3–4 questions per screen)
- **Core:** forced onboarding → online period logs → rule-based PCOS screening → AI explain (Groq/Gemini) → referral support → Make.com email/SMS  
- **Not MVP:** native apps, offline logging, dermatology vision, full clinician portal  

## Source context

Master product notes live in [`../CONTEXT.md`](../CONTEXT.md).  
Foundation docs should stay more decision-oriented and implementation-ready than `CONTEXT.md`.

## How to review

1. Read **01 → 11** in order (or jump to your concern).  
2. Mark anything wrong/missing (especially **04 rule weights**, **06 stack**, **11 components**).  
3. Once you approve, we freeze and start coding.

## How we work these

1. Discuss one topic at a time (or batch-review drafts).  
2. Capture decisions in that topic's file.  
3. Mark open questions clearly.  
4. Freeze the file before coding that area.

