# 02 — Users, Compliance & Research Framing

**Status:** Decisions captured for pitch / proposal  
**Last updated:** 2026-07-13  
**Depends on:** `01-mvp-scope.md`  
**Blocks:** onboarding consent UI, auth rules, Make.com channels, AI data-sharing copy

---

## 1. Purpose of this document

Define **who the system is for**, **how consent works**, and **how health data is handled** for P.R.O.M.I.S.E. as a **Philippines-based capstone research project** that will be **presented, proposed, and pitched**.

This is a **product/compliance design baseline**, not formal legal advice. Final ethics board / adviser requirements may refine wording later.

---

## 2. Study & product context (decided)

| Item | Decision |
|------|----------|
| Country / context | **Philippines** |
| Project type | **Capstone research project** (academic proposal / pitch) |
| Product form | Responsive web app (phone-first) |
| Target users | Adolescent and young adult **females, ages 12–24** |
| Clinical claim | **Screening / education / decision support only** — not diagnosis |

Because this will be pitched and proposed, compliance language should be **clear, defensible, and study-ready**, even if institutional review details are finalized later.

---

## 3. Target population

### 3.1 Inclusion (MVP design)
- Sex: **Female** (fixed for target population)
- Age: **12–24** (computed from date of birth at registration)
- Able to use a mobile browser / responsive web app
- Willing to create an account and provide health-related self-report data
- Consents to:
  - non-diagnostic nature of the app
  - collection/use of health information for the app + research framing
  - AI-assisted analysis (third-party LLM)
  - email/SMS notifications via automation (Make.com)

### 3.2 Exclusion (MVP design)
- Age under 12 or over 24
- Users seeking emergency care (app must redirect to professional/emergency help messaging)
- Users who decline required consents

### 3.3 Minors (12–17) — proposed for pitch
You indicated detailed minor-consent process can stay flexible for proposal stage.  
**Recommended default for the pitch** (easy to defend academically):

| Age band | Proposed consent model |
|----------|------------------------|
| **12–17** | **Parent/guardian consent + participant assent** (checkbox + acknowledgment text; digital attestation for MVP) |
| **18–24** | Participant consent only |

If the final study later restricts to 18+ only, registration rules can be tightened without redesigning the whole product.

**Open for adviser/ethics later:** whether guardian identity must be verified beyond self-attestation.

---

## 4. Roles & access model

### 4.1 End user (participant)
- Sees **only their own account data**
- Can create/edit own profile, menstrual logs, screening results, AI chat history (as implemented)
- Receives notifications intended for their account only

### 4.2 Researcher / student developer (you)
- System owner for the capstone
- May access backend/admin tooling as needed for development, demo, and study operations
- Must not expose one participant’s private health data to another participant

### 4.3 Adviser / co-researchers (optional later)
- Access only if study operations require it
- Prefer aggregated reports or controlled export over shared raw logins

### 4.4 Explicit non-role for MVP
- No full clinician portal
- No public social feed
- No cross-user data visibility

**Core privacy rule (decided):**  
Each user can only see data unique to their own account. Cross-account isolation is mandatory.

---

## 5. Data categories collected

### 5.1 Account / identity
- Full name
- Email
- Password (hashed; never stored plaintext)
- Date of birth / age
- Optional mobile number (needed for SMS)

### 5.2 Health baseline
- Height, weight, BMI (calculated)
- Family history, medical conditions, medications (as scoped)
- Lifestyle snapshot

### 5.3 Dynamic health data
- Menstrual records
- Symptom-related screening answers
- Risk assessment snapshots (inputs, score, category, timestamp)

### 5.4 AI interaction data
- User prompts / questions
- Model responses
- Context sent to LLM (screening summary, relevant profile facts — minimize where possible)

### 5.5 Notification / automation data
- Email address
- Mobile number (for SMS)
- Reminder preferences / schedule metadata
- Workflow event logs (e.g., reminder sent, follow-up triggered)

### 5.6 Not in MVP
- Dermatology images
- Offline-synced local-only stores as primary source of truth
- Payment data

---

## 6. Privacy model (decided direction)

### 6.1 Account isolation over research anonymization
**Decision:** No mandatory anonymization pipeline for MVP.  
Rationale: each user only accesses their own account; the product is account-scoped.

Implications:
- Data in the database may remain **identifiable** (name, email, health logs tied to user ID)
- Privacy is enforced primarily by **authentication + authorization**
- For presentations/demos, avoid showing real participant records; use test accounts

### 6.2 Still recommended good practice (for pitch credibility)
Even without full anonymization:
- Hash passwords
- Use HTTPS
- Restrict admin access
- Do not log secrets/API keys
- Minimize what is sent to third-party AI
- Allow account deletion / data removal request (simple process is enough for MVP proposal)

### 6.3 Research presentation use
When presenting results publicly:
- Prefer screenshots from dummy accounts
- Prefer aggregated findings (e.g., “X% completed screening”) over named participant data

---

## 7. Consent requirements (product)

Required acknowledgments before full app use:

1. **Non-diagnosis**  
   User understands P.R.O.M.I.S.E. does **not** diagnose PCOS and does not replace professional medical care.

2. **Health data collection**  
   User agrees that menstrual, profile, and screening data will be stored in their account to power app features and the capstone research system.

3. **AI-assisted analysis (third-party)**  
   User consents that relevant information may be sent to **Groq and/or Google Gemini** to generate explanations and educational responses.

4. **Notifications**  
   User consents to **email and/or SMS** reminders and study-related notifications via **Make.com** automation (based on provided contact details).

5. **Research / capstone framing**  
   User understands this system is developed as an academic capstone research project in the Philippines.

6. **Minor pathway (if age 12–17)**  
   Parent/guardian consent + participant assent (proposed).

Store for each consent:
- accepted (bool)
- timestamp
- policy/version string (e.g., `consent-v1`)

---

## 8. Third-party processing (must disclose)

| Service | Purpose | Data that may leave the app |
|---------|---------|-----------------------------|
| **Groq / Gemini** | AI explanations, education, chat | Prompt text + limited health context needed for answer |
| **Make.com** | Email/SMS workflows, reminders, follow-ups | Contact info + event metadata (e.g., reminder type, schedule) |
| Hosting / DB provider (TBD in stack doc) | App + data storage | Account and health records |

**Decision:** Third-party AI use is **allowed with explicit user consent**.

Guardrails to document in AI/stack docs:
- Do not send full unnecessary history if a short summary works
- Never send passwords
- System prompt forbids diagnosis/prescription language
- Safe fallback if AI provider is down

---

## 9. Notifications policy (decided)

| Channel | MVP |
|---------|-----|
| **Email** | Yes |
| **SMS** | Yes |
| Push (native) | No (web app) |

### Example Make.com-triggered messages
- Upcoming period reminder
- Missed menstrual tracking reminder
- Elevated-risk follow-up education / consult reminder
- Optional weekly educational tip

### Rules
- User must provide email (required for account)
- Mobile number required **only if SMS is enabled** for that user
- User should be able to manage notification preferences later (minimum: email on/off, SMS on/off)
- Messages must remain non-diagnostic and non-alarmist

---

## 10. Safety & crisis boundaries

The app must never present itself as emergency care.

If user expresses emergency symptoms or crisis intent in AI chat:
- Do not attempt clinical management
- Encourage contacting local emergency services / trusted adult / healthcare professional
- Keep language calm and clear

Always show non-diagnosis disclaimer on:
- risk result screens
- AI assistant screens
- referral guidance screens

---

## 11. Registration & eligibility rules (implementation-facing)

1. Collect DOB → compute age  
2. If age < 12 or > 24 → block registration with clear message  
3. If age 12–17 → show guardian consent + assent step (proposed)  
4. If age 18–24 → standard consent step  
5. Require non-diagnosis + data + AI + notification consents  
6. Create account only after required consents are accepted  

Sex is fixed to female for this study population in MVP.

---

## 12. Data retention (practical MVP stance)

| Topic | Stance for pitch/MVP |
|-------|----------------------|
| Active accounts | Retain while account exists and project is active |
| Anonymization pipeline | **Not required** for MVP (per decision) |
| Account isolation | **Required** |
| After capstone ends | Operator may keep system for demo/portfolio with test data; real participant data should be removable on request |
| Backups | Keep minimal; protect with same access controls |

Exact institutional retention rules can be added if the school/ethics board requires them.

---

## 13. Philippines / academic notes (proposal-ready)

Frame the project as:
- a **student capstone research system**
- intended for **screening support, education, monitoring, and referral guidance**
- **not** a licensed medical device or diagnostic service

For proposal/pitch materials, be ready to mention:
- informed consent screens in-app
- minor assent + guardian consent approach (if including 12–17)
- third-party AI and automation disclosures
- account-level confidentiality
- limitation: self-reported data, not clinical examination

If/when a school ethics review is required, this document becomes the draft basis for the protocol’s data & consent section.

---

## 14. Decisions log

| ID | Question | Decision |
|----|----------|----------|
| C1 | Country / study context | **Philippines** |
| C2 | Project posture | Capstone research; present / propose / pitch |
| C3 | Age range | **12–24** |
| C4 | Minor consent detail | Flexible for now; **proposed** guardian consent + assent for 12–17 |
| C5 | Research data access model | Account isolation first; researcher operates system for study/demo |
| C6 | Notification channels | **Email + SMS** via Make.com |
| C7 | Anonymization requirement | **Not required** for MVP; users only see own data |
| C8 | Third-party AI data sharing | **Yes, with consent** (Groq/Gemini) |

---

## 15. Product copy snippets (draft)

### Non-diagnosis
> P.R.O.M.I.S.E. is a screening and education support tool. It does **not** diagnose PCOS and does not replace advice from a licensed healthcare professional.

### AI third-party
> To generate explanations and educational guidance, some of your questions and relevant health context may be processed by third-party AI services (such as Groq or Google Gemini). Do not share information you are uncomfortable sending.

### Notifications
> We may send email and SMS reminders (for example, period tracking or follow-up education) using automated workflows. Message frequency depends on your activity and preferences.

### Research framing
> This application is developed as a capstone research project in the Philippines to explore AI-assisted menstrual health monitoring and PCOS risk screening support among females aged 12–24.

---

## 16. Implementation checklist (later build)

- [ ] DOB age gate (12–24)
- [ ] Consent checkboxes with timestamps + version
- [ ] Optional guardian consent flow for 12–17
- [ ] Auth so users only read/write own records
- [ ] Email required; mobile optional unless SMS enabled
- [ ] Make.com hooks for email + SMS
- [ ] AI consent before first assistant use (or during onboarding)
- [ ] Disclaimer components on risk/AI/referral pages
- [ ] Simple account/data deletion request path

---

## 17. Open items (non-blocking for pitch)

| ID | Topic | Notes |
|----|--------|-------|
| X1 | Final ethics board process | Confirm with school/adviser if required |
| X2 | Guardian verification strength | Self-attestation vs stronger proof |
| X3 | SMS provider through Make.com | Choose later in stack/ops |
| X4 | Exact privacy policy page text | Expand from snippets above |
| X5 | Researcher export format | Only if study analysis needs bulk export |

---

## 18. Sign-off

| Role | Name | Date | Approved? |
|------|------|------|-----------|
| Student researcher / product owner | | | |
| Adviser | | | |

---

## Next document

**`03-user-journeys.md`** — core end-to-end flows for the responsive web MVP  
(register → onboard → log period → screen → AI explain → referral → notifications)
