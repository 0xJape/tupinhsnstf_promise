# 10 — Success Metrics & Definition of Done

**Status:** Draft v1  
**Last updated:** 2026-07-13  
**Depends on:** all prior foundation docs  

---

## 1. Purpose

Define when the MVP is “done enough” for:
- internal testing  
- capstone demo / defense  
- optional small pilot with participants  

---

## 2. Product definition of done (MVP)

### 2.1 Must-pass functional checklist

| # | Criterion | Pass? |
|---|-----------|-------|
| F1 | Register with email/password | |
| F2 | Age gate enforces 12–24 | |
| F3 | Required consents stored with timestamp + version | |
| F4 | Forced onboarding blocks Home until complete | |
| F5 | Profile stores height/weight and BMI | |
| F6 | Create/list/edit menstrual log (online) | |
| F7 | Cycle insights compute with ≥2 logs | |
| F8 | Screening available without any period logs | |
| F9 | Rule engine returns Low/Moderate/High reproducibly | |
| F10 | Assessment snapshot saved (inputs, score, version) | |
| F11 | Moderate/High always shows referral checklist | |
| F12 | AI assistant reachable anytime post-consent | |
| F13 | AI explains result without diagnosing | |
| F14 | AI fallback works if providers fail | |
| F15 | Notification prefs for email/SMS | |
| F16 | At least one Make.com workflow sends successfully | |
| F17 | RLS/account isolation: user A cannot read user B | |
| F18 | Demo account + sample data for defense | |
| F19 | Responsive UI usable on phone viewport | |
| F20 | Disclaimers on risk, AI, referral, landing | |

### 2.2 Explicit non-goals (do not block done)
- Dermatology upload  
- Offline logging  
- Native apps  
- Full clinician portal  
- Perfect period prediction accuracy  
- Multi-language UI  

---

## 3. Quality bars

| Area | Bar |
|------|-----|
| Rule engine | Unit tests for table cases in `04` (T1–T6 minimum) |
| Security | No public tables without RLS; secrets server-only |
| AI safety | Spot-check refusals for diagnosis & dosing |
| UX | Complete first-time path under ~15–20 minutes |
| Reliability | Core flows work without Make.com; AI optional with fallback |
| Demo | Full story runnable in ≤ 10 minutes |

---

## 4. Capstone research metrics (suggested)

Use for chapter results / evaluation (adjust to your methodology).

### 4.1 Usability (example)
After pilot or expert review:
- Task success rate for: onboard, log period, complete screening, open AI  
- SUS or simple 5-point ease questions  
- Time on task  

### 4.2 System correctness
- % of screening submissions with stored snapshots  
- Rule reproducibility test pass rate = 100% on fixed fixtures  
- Referral block present on 100% of Moderate/High results  

### 4.3 Engagement (if pilot runs)
- % users completing onboarding  
- % completing at least one screening  
- % logging ≥1 period  
- % opening AI explain CTA  

### 4.4 Safety / compliance process metrics
- Consent completion rate among registered users  
- No critical incidents of cross-account data leak in test  
- Disclaimer present on required screens (audit checklist)  

---

## 5. Demo success criteria (defense day)

| Step | Success |
|------|---------|
| Explain problem & non-diagnostic stance | Clear verbal + on-screen disclaimer |
| Show onboarding / profile baseline | Data captured |
| Show menstrual tracking | Log + insight |
| Show screening + score factors | Explainable points |
| Show Moderate/High referral | Checklist visible |
| Show AI explanation | Non-diagnostic language |
| Mention Make.com automation | Live or evidence screenshot |
| Q&A on architecture | Rules vs AI separation clear |

---

## 6. Suggested milestones (timeline template)

Adjust to your school calendar.

| Phase | Focus | Exit |
|-------|-------|------|
| Week 1 | Scaffold, auth, profile, onboarding | Forced onboarding works |
| Week 2 | Menstrual module + cycle math | Logs + insights |
| Week 3 | Rule engine + screening + results + referral | Snapshots + categories |
| Week 4 | AI proxy + guardrails + fallback | Explain flow works |
| Week 5 | Make.com email/SMS + prefs | One live workflow |
| Week 6 | Demo seed, polish, tests, deploy, defense dry run | DoD checklist green |

If shorter: cut education tips cadence and deep profile fields first; never cut disclaimers/rules/referral.

---

## 7. Testing plan (minimum)

1. **Unit:** `pcosScreen` scoring + BMI + thresholds  
2. **Unit:** cycle length / next period edge cases  
3. **Integration:** auth + RLS policies with two users  
4. **Manual:** full Journey A→F on mobile browser  
5. **Manual:** AI refusal prompts  
6. **Manual:** Make.com test email/SMS to your numbers  
7. **Demo reset** rehearsal  

---

## 8. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| AI says “you have PCOS” | Strong system prompt + output spot checks + fallback |
| Score disputed clinically | Label as educational v1 instrument; versioned rules |
| SMS cost / delivery issues | Email-first; SMS optional toggle |
| Scope creep (derm, offline) | Enforce `01` out-of-scope list |
| Ethics questions in defense | Use `02` consent & PH research framing |

---

## 9. Final freeze statement

MVP is ready to present when **all F1–F20** are checked (or explicitly waived in writing), rule tests pass, and the demo script runs on a phone-sized viewport without critical bugs.

---

## 10. Document set status

| Doc | Role |
|-----|------|
| 01 Scope | What we build |
| 02 Compliance | Who + consent + PH research |
| 03 Journeys | How users move |
| 04 Rules | How risk is computed |
| 05 Data | What we store |
| 06 Stack | How we build it |
| 07 AI | How AI must behave |
| 08 Content | What we say |
| 09 UX | What users see |
| 10 Metrics | When we’re done |

---

## Next after your review

1. You mark edits on any doc (especially `04` weights/thresholds).  
2. Freeze docs.  
3. Start implementation in the order in `06` §11.
