# 01 — MVP Scope Freeze

**Status:** Decisions captured — ready to refine in later docs  
**Last updated:** 2026-07-13  
**Depends on:** `CONTEXT.md` vision and modules  
**Blocks:** journeys, rule engine detail, stack choices, UI build

---

## 1. Product one-liner

P.R.O.M.I.S.E. is an **AI-assisted web-based clinical decision support system (MCDSS)** for adolescent and young adult females (ages **12–24**).  
It supports **menstrual monitoring, PCOS risk screening, education, referral guidance, and automated reminders**.  
It is **not** a diagnostic tool and does **not** replace a clinician.

**Project type:** Capstone research project (academic study context).

---

## 2. Core philosophy (non-negotiable)

| Layer | Responsibility |
|-------|----------------|
| Calculations | BMI, cycle length, dates, predictions |
| Rules | Screening score, risk class, referral triggers |
| AI / LLM (Groq or Gemini) | Explanation, education, conversational support |
| Automation (Make.com) | Reminders, follow-ups, notification workflows |

**Rule:** AI never computes the risk score. Rules never "chat." Each layer stays in its lane.

---

## 3. Delivery platform (decided)

| Decision | Choice |
|----------|--------|
| Product form | **Responsive web app** (not native mobile) |
| Primary UX target | **Phone-sized screens first** |
| Also support | Tablet / desktop layouts where practical |
| Offline period logging | **Out of scope for now** (online-only data entry) |

Design and QA priority: mobile viewport → then larger screens.

---

## 4. MVP goal

Ship a usable **responsive web app** where a participant can:

1. Create an account and complete a short health baseline profile  
2. Log menstrual periods (while online) and see basic cycle insights  
3. Complete a rule-based PCOS risk screening  
4. Receive an explainable risk result (Low / Moderate / High)  
5. Get AI-assisted explanation and educational guidance (Groq or Gemini)  
6. See clinical referral support when risk is elevated  
7. Receive automated reminders / follow-ups via **Make.com** workflows  

If those outcomes work safely and clearly for the capstone study, MVP is successful.

---

## 5. In scope for MVP

### 5.1 Account & profile (baseline only)
- Email-based account creation / sign-in  
- Onboarding in short steps (not one long form)  
- Age eligibility: **12–24** (enforced at registration; parental/guardian consent details in `02-users-compliance.md`)  
- Required baseline fields:
  - Name, date of birth / age, sex fixed as female  
  - Height, weight → auto BMI  
  - Family history (PCOS-relevant checkboxes)  
  - Existing conditions (limited set)  
  - Basic lifestyle (activity, sleep, stress)  
  - Required consents (non-diagnosis, data use, AI analysis, research participation as applicable)  
- Editable profile after onboarding  

### 5.2 Menstrual health monitoring
- Log period start date  
- Duration, flow, pain level  
- Cycle regularity notes / flags  
- Computed:
  - Cycle length  
  - Irregular / missed period indicators  
  - Simple next-period estimate (when enough data exists)  
- History list / calendar-style view (simple is fine)  
- **Requires network connectivity** (no offline queue / sync for now)  

### 5.3 PCOS risk screening (rule-based)
- Evidence-oriented questionnaire (final items in `04-rule-engine.md`)  
- Inputs may include irregular cycles, acne, hirsutism, hair loss, weight gain, family history, BMI, etc.  
- Weighted scoring → **Low / Moderate / High**  
- Store assessment snapshot: answers, score, category, timestamp  
- Result screen always includes non-diagnosis disclaimer  

### 5.4 AI health assistant (Groq or Gemini)
- Provider: **Groq and/or Google Gemini** (final pick in `06-tech-stack.md`)  
- Explain screening result in plain language  
- Answer general PCOS / menstrual education questions  
- Provide non-prescriptive lifestyle education  
- Summarize user-visible patterns (e.g., irregular cycles + acne)  
- Hard safety constraints (detailed in `07-ai-guardrails.md`)  
- Fallback behavior if LLM is unavailable (templated safe message) — to define in AI/stack docs  

### 5.5 Clinical referral support
- If Moderate/High (exact rules TBD): recommend professional consultation  
- Explain **why** referral is suggested (based on rule outputs)  
- Simple "prepare for visit" checklist / talking points  
- No appointment booking required in MVP  

### 5.6 Notifications & automation (Make.com)
- Integrate **Make.com** workflows for study-friendly automation, e.g.:
  - Upcoming menstrual reminders  
  - Missed tracking reminders  
  - Follow-up reminders for elevated-risk users  
  - Educational / weekly summary notifications (as study design allows)  
- App triggers or schedules events that Make.com can consume (webhook / scheduled scenario — details in stack doc)  
- Channels may include email and/or other Make.com-supported channels (finalize in compliance + stack docs)  

### 5.7 Safety & trust surfaces
- Persistent "not a diagnosis" messaging on risk and AI screens  
- Consent capture before health data / AI use / research participation  
- Clear empty / error / **online-required** states for core flows  
- Capstone research disclaimers and data-use language (see compliance doc)  

### 5.8 Responsive web UX
- Mobile-first layouts (phone widths as primary)  
- Touch-friendly forms and navigation  
- Usable on common mobile browsers  
- Basic tablet/desktop responsiveness  

---

## 6. Out of scope for MVP

| Feature | Why deferred / excluded |
|---------|-------------------------|
| Native iOS / Android apps | Web-first responsive approach |
| Offline period logging / offline-first sync | Explicitly deferred |
| Dermatology image upload / vision analysis | High complexity, privacy, clinical risk |
| Medication reminders as clinical product feature | Safety complexity beyond capstone MVP |
| Clinician / admin portal (full) | Separate surface; research export may be enough later |
| Full dietary coaching program | Light AI education only |
| Emergency contact as required field | Optional later unless study requires |
| Profile picture | Nice-to-have only |
| Deep longitudinal analytics dashboards | Needs more data over time |
| Multi-language support | Unless required by study design |
| Wearable integrations | Not essential |
| Payment / subscriptions | Not needed for capstone research |

---

## 7. Explicit non-goals (never claim these)

- Diagnosing PCOS  
- Prescribing medication or treatment plans  
- Replacing OB-GYN / pediatric / primary care evaluation  
- Guaranteeing period prediction accuracy  
- Providing emergency medical care  
- Functioning as a consumer medical device without research framing  

---

## 8. MVP modules vs later modules

| Module | MVP | Later |
|--------|-----|-------|
| User Profile | Yes (baseline) | Deeper lifestyle/diet detail |
| Menstrual Tracker | Yes (online only) | Offline support, advanced insights |
| PCOS Risk Screening | Yes | Refined scoring / multi-version instruments |
| AI Health Assistant | Yes (Groq or Gemini) | Richer coaching, multi-turn care plans |
| Clinical Referral Support | Yes (guidance only) | Provider directory, booking |
| Lifestyle Management | Light (AI tips) | Structured programs, tracking goals |
| Notifications (Make.com) | **Yes** | More channels / richer campaigns |
| Dermatological Assessment | No | Vision-assisted observations |
| Native mobile apps | No | Optional if research expands |

---

## 9. Suggested onboarding scope for MVP

Keep first-run short. Recommended steps:

1. **Account & personal info** — name, email, DOB/age (enforce 12–24)  
2. **Physical profile** — height, weight (waist optional)  
3. **Medical & family history** — limited checkboxes  
4. **Lifestyle snapshot** — activity, sleep, stress (diet can be lighter)  
5. **Consent** — non-diagnosis, research data use, AI assistance, guardian consent if required  

Defer heavy diet detail, allergies, emergency contact, and profile photo unless the study protocol requires them.

---

## 10. Definition of done (MVP product)

MVP is ready for capstone testing when:

- [ ] New user can register (age 12–24), consent, and finish baseline profile  
- [ ] UI is usable on phone-sized viewports (responsive web)  
- [ ] User can log at least one menstrual record online and view history  
- [ ] User can complete screening and receive Low/Moderate/High  
- [ ] Score is reproducible from the same inputs (rule engine)  
- [ ] Result explanation works via Groq or Gemini (with safe fallback)  
- [ ] Elevated risk always shows referral guidance  
- [ ] At least one Make.com workflow runs end-to-end (e.g., reminder or follow-up)  
- [ ] App never presents result as a diagnosis  
- [ ] Research/capstone disclaimers and consents are present  

---

## 11. Decisions log

| ID | Question | Decision | Notes |
|----|----------|----------|-------|
| S1 | Primary delivery platform? | **Responsive web app**, phone-first | Not native mobile |
| S2 | App type? | **Capstone research project** | Academic study context |
| S3 | Age range? | **12–24** | Parental/guardian consent policy still needed in doc 02 |
| S4 | Notifications? | **Yes — Make.com workflows in MVP** | Channels & triggers TBD |
| S5 | AI provider direction? | **Groq or Gemini** | Final model choice in stack/AI docs |
| S6 | Offline period logging? | **No (deferred)** | Online-only logging for now |
| S7 | Target timeline for MVP? | _Still open_ | Optional for planning |

---

## 12. Locked MVP freeze (current)

**MVP = Responsive web app + Profile + Online menstrual log + Rule-based screening + Groq/Gemini explanation + Referral guidance + Make.com automation**  

**Not MVP = Native apps, offline logging, dermatology, clinician portal, deep coaching programs**

---

## 13. Remaining open items (carry to next docs)

These are **not** blockers for freezing high-level scope, but must be answered soon:

| ID | Topic | Goes to |
|----|--------|---------|
| O1 | Parental/guardian consent for ages 12–17 | Proposed in `02-users-compliance.md` (guardian + assent) |
| O2 | IRB / school ethics / informed consent text | Draft framing in `02`; finalize with adviser if required |
| O3 | Exact Make.com channels | **Email + SMS** (decided in `02`) |
| O4 | Final LLM: Groq vs Gemini (or both with fallback) | `06-tech-stack.md` + `07-ai-guardrails.md` |
| O5 | Capstone timeline / demo milestones | `10-success-metrics.md` |
| O6 | Whether researchers need a simple data export view | `05-data-model.md` / later |

---

## 14. Sign-off

| Role | Name | Date | Approved? |
|------|------|------|-----------|
| Product owner / student researcher | | | |
| Adviser / clinical reviewer (if any) | | | |
| Engineering | | | |

---

## Next document

**`02-users-compliance.md`** — age 12–24 rules, research consent, privacy, guardian consent, data handling for a capstone study.

