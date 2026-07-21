# 03 — User Journeys (MVP)

**Status:** Decisions captured  
**Last updated:** 2026-07-13  
**Depends on:** `01-mvp-scope.md`, `02-users-compliance.md`  
**Blocks:** UX/IA screens, data model events, Make.com triggers, implementation order

---

## 1. Purpose

Define the **core end-to-end journeys** for the P.R.O.M.I.S.E. responsive web MVP so development, UI, and demos stay aligned.

**Product form:** phone-first web app  
**Users:** participants (12–24, female) + demo/researcher access for capstone defense

---

## 2. Journey decisions (locked)

| ID | Question | Decision |
|----|----------|----------|
| J1 | Onboarding | **Forced full onboarding** before home/app features |
| J2 | When is screening available? | **Immediately after onboarding** (period log not required first) |
| J3 | AI assistant access | **Open anytime** after required consents |
| J4 | Elevated-risk path | **Always show referral checklist** + optional AI explanation |
| J5 | Demo / defense access | **Yes — demo (researcher) mode** for presentation |
| J6 | Screening UI density | **Grouped pages OK** (≈3–4 questions per screen; mobile-friendly Yes/No) |

---

## 3. Actors

| Actor | Goal |
|-------|------|
| **Participant** | Create account, complete profile, track periods, screen PCOS risk, learn via AI, get referral guidance |
| **Demo / researcher** | Run a controlled walkthrough for pitch/defense without relying on a random live user |
| **System (rules)** | Compute BMI, cycles, risk score, referral flags |
| **AI (Groq/Gemini)** | Explain results, educate, answer questions (never scores risk) |
| **Make.com** | Send email/SMS reminders and follow-ups |

---

## 4. Global rules across journeys

1. **Auth required** for all health features.  
2. **Age gate 12–24** at registration.  
3. **Full onboarding + consents required** before dashboard.  
4. Users only access **their own** data.  
5. Every risk/AI/referral surface shows **non-diagnosis** disclaimer.  
6. Menstrual logging is **online-only** (no offline queue).  
7. AI never calculates the risk score.  
8. Notifications use **email + SMS** via Make.com when contact details/preferences allow.

---

## 5. Information architecture (journey map)

```text
Landing / Login
    │
    ├─ Register → Age gate → Consents → Forced onboarding (all steps)
    │                                      │
    │                                      ▼
    └─ Login ─────────────────────► App Shell (Home)
                                      │
          ┌───────────────┬───────────┼────────────┬──────────────┐
          ▼               ▼           ▼            ▼              ▼
     Home / Insights  Period Log  Risk Screen  AI Assistant   Profile
                                      │
                                      ▼
                               Result + Disclaimer
                                      │
                    ┌─────────────────┴─────────────────┐
                    ▼                                   ▼
            Low / Moderate                    Moderate / High
            education + AI                    Referral checklist
                                              + AI explanation
```

---

## 6. Journey A — Registration, consent, forced onboarding

### Goal
Create an eligible account and capture baseline data required for assessment.

### Preconditions
- User is on a mobile browser / responsive web view
- Not already authenticated

### Steps
1. Open landing page → **Sign up**
2. Enter email + password (+ confirm password)
3. Enter personal basics: full name, date of birth
4. **Age gate**
   - If age < 12 or > 24 → block with clear message
   - If 12–17 → show **guardian consent + participant assent** (proposed)
   - If 18–24 → standard consent path
5. Accept required consents:
   - Non-diagnosis
   - Health data collection / research framing
   - AI third-party processing
   - Email/SMS notifications
6. **Forced onboarding wizard** (cannot skip):
   1. Physical profile — height, weight (BMI auto), waist optional
   2. Family history — checkboxes
   3. Medical history / medications — limited set
   4. Lifestyle snapshot — activity, sleep, stress (+ light diet if included)
   5. Review summary → confirm
7. Land on **Home / Dashboard**

### Success
- Account created
- Consents stored with timestamp + version
- Baseline profile complete
- User can access app features

### Failure / edge cases
| Case | Behavior |
|------|----------|
| Invalid email / weak password | Inline validation, stay on step |
| Age out of range | Block registration |
| Required consent unchecked | Cannot continue |
| Incomplete onboarding step | Next disabled until required fields filled |
| Network error mid-onboarding | Save progress if possible; otherwise resume from last incomplete step on next login |
| Already onboarded user logs in | Skip wizard → Home |

### Exit criteria
`onboardingComplete = true` and all required consents accepted.

---

## 7. Journey B — Login (returning participant)

### Goal
Return to the app and continue tracking / screening.

### Steps
1. Open app → Login
2. Enter email + password
3. Route by state:
   - Onboarding incomplete → resume forced onboarding
   - Complete → Home

### Success
Authenticated session; correct route.

### Edge cases
- Wrong credentials → error, no account enumeration beyond generic message if preferred
- Session expired mid-flow → re-auth, return to intended page when safe

---

## 8. Journey C — Log menstrual period (online)

### Goal
Record period data and see basic cycle insights.

### Preconditions
- Logged in
- Onboarding complete
- Online

### Steps
1. From Home or Period tab → **Log period**
2. Enter:
   - Start date (required)
   - Duration
   - Flow
   - Pain level
   - Optional notes / regularity flag
3. Save
4. System computes (when enough history exists):
   - Cycle length
   - Irregular / missed indicators
   - Simple next-period estimate
5. User sees updated history / calendar-style list + insights cards

### Success
New menstrual record stored and visible only to that user.

### Edge cases
| Case | Behavior |
|------|----------|
| Offline / network fail | Block save; show “connection required” |
| Overlapping / duplicate start dates | Validate; ask to edit existing or correct date |
| First-ever log | Show empty-state education; limited predictions until more data |
| Edit / delete log | Allowed for own records; recompute insights |

### Make.com hooks (optional triggers)
- After first period log → optional “tracking started” confirmation (email/SMS)
- If user misses expected log window → **missed tracking reminder**
- Before predicted period → **upcoming period reminder**

---

## 9. Journey D — PCOS risk screening (available anytime after onboarding)

### Goal
Complete rule-based screening and receive Low / Moderate / High result.

### Preconditions
- Onboarding complete (baseline data available)
- Online

### Notes
- **Does not require** a prior menstrual log
- May prefill / use profile data (BMI, family history, etc.)
- Score is **rule engine only**

### Steps
1. User opens **Risk Screening** from Home or nav
2. Sees intro: purpose + non-diagnosis disclaimer
3. Answers questionnaire in **grouped pages** (≈3–4 Yes/No items per screen; progress across groups)
4. Review answers → Submit
5. Rule engine calculates weighted score → category
6. Store assessment snapshot: answers, score, category, timestamp, rule version
7. Show **Result screen**

### Result screen (all categories)
- Risk category badge (Low / Moderate / High)
- Top contributing factors (explainable, from rules — not AI invention)
- Non-diagnosis disclaimer
- CTA: **Ask AI to explain**
- CTA: **Log period** / **Update profile** if relevant data missing or stale
- If Moderate or High → Journey E referral block is **mandatory on this screen**

### Success
Reproducible score from same inputs; snapshot saved.

### Edge cases
| Case | Behavior |
|------|----------|
| Exit mid-questionnaire | Confirm discard or save draft (draft optional; discard OK for MVP) |
| Missing BMI / profile fields | Should not happen if onboarding forced; if data deleted later, prompt to update profile |
| Rescreen | Allowed; keep history of past assessments |

---

## 10. Journey E — Elevated risk → referral support (+ AI)

### Goal
For **Moderate** and **High** results, always guide the user toward professional consultation without diagnosing.

### Preconditions
- Screening result is Moderate or High

### Steps (always shown)
1. On result screen, show **Referral Support** section:
   - Clear recommendation to consult a healthcare professional
   - **Why this was suggested** (rule-based factors list)
   - **Prepare for your visit** checklist (symptoms to mention, questions to ask, what to bring)
2. User may:
   - Expand checklist
   - Copy/share notes for visit (optional nice-to-have)
   - Tap **Explain with AI** for plain-language explanation
3. Optional: trigger Make.com **elevated-risk follow-up** email/SMS (education + gentle consult reminder)

### Success
User always sees referral guidance on elevated results; AI is optional enhancement, not a gate.

### Edge cases
- AI unavailable → still show full referral checklist + templated safe explanation
- User dismisses AI → checklist remains

### Low risk path
- No hard referral requirement
- Still show education + optional AI
- Soft message: monitor symptoms and seek care if concerned

---

## 11. Journey F — AI health assistant (open access)

### Goal
Provide education, result explanation, and supportive guidance anytime after consent.

### Preconditions
- Onboarding + AI consent complete
- Online
- LLM configured (Groq or Gemini)

### Entry points
- Main nav: **AI Assistant**
- Risk result: **Explain my result**
- Home insight cards: **Ask about this**
- Referral section: **Help me understand**

### Steps
1. User opens assistant
2. Sees disclaimer (not a doctor / not a diagnosis)
3. Chats or uses suggested prompts:
   - Explain my latest risk result
   - What do irregular periods mean?
   - Lifestyle tips for my profile
   - How do I prepare for a clinic visit?
4. Backend sends **minimized context** (e.g., latest risk category + key factors + relevant profile summary)
5. AI responds in plain, non-prescriptive language
6. Conversation saved to user’s own history (if enabled)

### Hard limits (journey-level)
- No diagnosis claims
- No medication dosing / prescriptions
- No emergency management — redirect to professional/emergency help
- If model fails → safe fallback message

### Success
User gets understandable guidance; system remains non-diagnostic.

---

## 12. Journey G — Notifications (Make.com)

### Goal
Automate email/SMS reminders without building a full notification platform.

### Preconditions
- User consented to notifications
- Email present; mobile number present if SMS enabled
- Make.com scenarios configured

### Primary flows
| Trigger | Channel | Message intent |
|---------|---------|----------------|
| Predicted period approaching | Email / SMS | Upcoming period reminder |
| No log after expected window | Email / SMS | Missed tracking reminder |
| Moderate/High screening result | Email / SMS | Follow-up education + consult reminder |
| Optional weekly cadence | Email / SMS | Light educational tip |

### Participant experience
1. User sets or accepts notification preferences (email on/off, SMS on/off)
2. App emits event / scheduled payload to Make.com
3. Make.com sends message
4. User returns via link (if included) → login → relevant screen

### Edge cases
- SMS selected but no mobile number → prompt to add number or disable SMS
- Webhook failure → log error; do not block core app use
- User opts out → stop future sends

---

## 13. Journey H — Profile management

### Goal
Keep baseline data accurate for scoring and personalization.

### Steps
1. Open Profile
2. Edit allowed fields (physical, history, lifestyle, contacts, notification prefs)
3. Save → BMI recalculated if height/weight change
4. Optional: re-run screening suggested if major risk inputs changed

### Notes
- Password change / logout available here
- Consents viewable; re-accept if policy version changes later

---

## 14. Journey I — Demo / researcher mode (capstone defense)

### Goal
Support pitch and oral defense with a reliable walkthrough.

### Decision
Include a **demo mode** (not a full clinician portal).

### Recommended approach (MVP-friendly)
1. **Seeded demo participant account**
   - e.g. `demo@promise.local` / known password for presenters only
   - Preloaded: profile, 2–3 menstrual logs, one completed screening (Moderate sample), sample AI prompts
2. **Optional demo launcher page** (protected or known only to team)
   - “Reset demo data” button for clean reruns
   - Quick links: Onboarding preview, Screening, Elevated result, AI, Make.com test event
3. **Presentation script path** (canonical demo order):
   1. Landing + non-diagnosis framing  
   2. Login as demo user (or fast-forward through onboarding on a fresh demo reset)  
   3. Home insights  
   4. Log / show menstrual history  
   5. Run or open screening result  
   6. Show elevated referral checklist  
   7. AI explanation  
   8. Mention Make.com email/SMS automation (live or recorded)  

### Rules
- Demo account uses **fictional data only**
- Never project real participant PHI in defense
- Demo reset must not touch real user tables (separate flag or separate environment preferred)

### Success
You can complete a full product story in one continuous demo without depending on live network flakiness (AI/Make.com can have recorded fallback if needed).

---

## 15. Happy-path master flow (first-time participant)

```text
Sign up
  → Age eligible (12–24)
  → Consents accepted
  → Forced onboarding completed
  → Home
  → (Optional) Log period
  → Start Risk Screening
  → Submit questionnaire
  → View score + category
  → If Moderate/High: referral checklist shown
  → Open AI to explain result
  → Receive Make.com reminder later (email/SMS)
```

---

## 16. Screen list derived from journeys (MVP)

| Screen / view | Journeys |
|---------------|----------|
| Landing | A, B, I |
| Register | A |
| Login | B, I |
| Age blocked | A |
| Guardian consent / assent (12–17) | A |
| Consent step | A |
| Onboarding steps 1–N | A |
| Home / dashboard | C–I |
| Period log form | C |
| Period history / insights | C |
| Screening intro | D |
| Screening questionnaire | D |
| Screening result | D, E |
| Referral checklist (section or page) | E |
| AI assistant chat | F, E |
| Profile / settings | H |
| Notification preferences | G, H |
| Demo launcher / reset (team) | I |
| Error / offline-required states | global |

Detailed layout belongs in `09-ux-ia.md`.

---

## 17. Analytics / research events (lightweight)

Useful for capstone evaluation (store only what you need):

| Event | When |
|-------|------|
| `signup_completed` | Account created |
| `onboarding_completed` | Forced wizard done |
| `period_logged` | Menstrual record saved |
| `screening_completed` | Risk result generated |
| `referral_viewed` | Elevated result shown |
| `ai_chat_started` | First message in session |
| `ai_explain_result` | Explain CTA used |
| `notification_event_emitted` | Payload sent to Make.com |

No cross-user profiles. Participant-level events remain account-scoped.

---

## 18. Journey acceptance checklist

- [ ] New user cannot reach Home without full onboarding  
- [ ] Screening is available immediately after onboarding  
- [ ] Screening works with zero period logs  
- [ ] AI is reachable from nav and from result screen  
- [ ] Moderate/High always shows referral checklist even if AI is down  
- [ ] Period save fails gracefully offline  
- [ ] Demo account can walk full story for defense  
- [ ] Disclaimers visible on risk, AI, referral  

---

## 19. Open items (minor)

| ID | Topic | Notes |
|----|--------|-------|
| J-O1 | Save draft mid-screening? | Optional; discard is OK for MVP |
| J-O2 | Demo reset implementation | Separate env vs `is_demo` flag |
| J-O3 | Exact Make.com payload shape | Define in stack doc |
| J-O4 | Deep links from SMS/email | Nice-to-have for return-to-app |

---

## 20. Sign-off

| Role | Name | Date | Approved? |
|------|------|------|-----------|
| Student researcher | | | |
| Adviser | | | |

---

## Next document

**`04-rule-engine.md`** — screening questions, weights, thresholds (Low/Moderate/High), referral triggers, BMI rules, versioning.

