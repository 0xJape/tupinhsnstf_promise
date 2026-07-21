# 05 — Data Model & Storage

**Status:** Draft v1 for MVP  
**Last updated:** 2026-07-13  
**Depends on:** `01`–`04`, `02-users-compliance.md`

---

## 1. Goals

- Account-scoped health data (users only see their own rows)
- Support forced onboarding, menstrual logs, rule-based assessments, AI chats, Make.com events
- Store **assessment snapshots** for reproducibility and capstone evidence
- Support **demo accounts** without mixing into research narrative carelessly

---

## 2. Storage decisions (proposed)

| Concern | MVP choice |
|---------|------------|
| Primary database | **PostgreSQL** (via Supabase recommended) |
| Auth | **Supabase Auth** (email/password) |
| File storage | Not needed in MVP (no derm images) |
| ORM / client | Supabase JS client + Row Level Security (RLS) |
| Secrets | Env vars (LLM keys, Make.com webhook secret) |

Alternative acceptable: Firebase Auth + Firestore with equivalent security rules.  
**Recommendation for capstone:** Supabase (SQL, RLS, fast to demo).

---

## 3. Entity overview

```text
users (auth.users)
  └── profiles
        ├── consents
        ├── family_history / medical flags (or JSON on profile)
        ├── menstrual_logs
        ├── risk_assessments
        ├── ai_conversations
        │     └── ai_messages
        ├── notification_preferences
        └── notification_events
```

---

## 4. Tables

### 4.1 `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | = auth.user id |
| email | text | denormalized for convenience |
| full_name | text | required |
| date_of_birth | date | required; age derived |
| sex | text | fixed `'female'` |
| mobile_number | text null | for SMS |
| height_cm | numeric | required after onboarding |
| weight_kg | numeric | required after onboarding |
| waist_cm | numeric null | optional |
| bmi | numeric | computed/stored |
| activity_level | text null | enum-like |
| exercise_frequency | text null | |
| sleep_band | text null | |
| stress_level | int null | 1–5 |
| smoking | boolean null | |
| alcohol_band | text null | |
| diet_habits | jsonb null | light structure |
| medications | jsonb null | list / free text |
| conditions | text[] or jsonb | checkbox set |
| family_history | text[] or jsonb | checkbox set |
| onboarding_complete | boolean | default false |
| is_demo | boolean | default false |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 4.2 `consents`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK | |
| policy_version | text | e.g. `consent-v1` |
| non_diagnosis | boolean | |
| health_data | boolean | |
| ai_third_party | boolean | |
| notifications | boolean | |
| research_framing | boolean | |
| guardian_consent | boolean null | for 12–17 |
| participant_assent | boolean null | for 12–17 |
| accepted_at | timestamptz | |

### 4.3 `menstrual_logs`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK | |
| start_date | date | required |
| duration_days | int null | |
| flow | text null | light/medium/heavy |
| pain_level | int null | 0–10 or 1–5 |
| notes | text null | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Unique suggestion: prevent exact duplicate `(user_id, start_date)` or allow edit-in-place.

### 4.4 `risk_assessments`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK | |
| rule_version | text | `pcos-screen-v1` |
| answers | jsonb | questionnaire |
| bmi_at_assessment | numeric | |
| item_points | jsonb | |
| total_score | int | |
| category | text | Low/Moderate/High |
| contributing_factors | jsonb | |
| referral_recommended | boolean | |
| created_at | timestamptz | |

### 4.5 `ai_conversations` / `ai_messages`
**conversations:** id, user_id, title null, created_at  
**messages:** id, conversation_id, role (`user`|`assistant`|`system`), content, model, created_at  

Optional: `related_assessment_id` on conversation.

### 4.6 `notification_preferences`
| Column | Type |
|--------|------|
| user_id | uuid PK/FK |
| email_enabled | boolean |
| sms_enabled | boolean |
| period_reminders | boolean |
| missed_log_reminders | boolean |
| risk_followups | boolean |
| education_tips | boolean |

### 4.7 `notification_events`
Audit of what was emitted to Make.com.

| Column | Type |
|--------|------|
| id | uuid |
| user_id | uuid |
| event_type | text |
| payload | jsonb |
| channel | text | email/sms/both |
| status | text | queued/sent/failed |
| provider_ref | text null |
| created_at | timestamptz |

### 4.8 Optional `analytics_events`
Lightweight capstone metrics: `event_name`, `user_id`, `meta jsonb`, `created_at`.

---

## 5. Auth & security

### Row Level Security (required)
- `profiles`: select/update where `id = auth.uid()`
- All child tables: `user_id = auth.uid()`
- No public read

### Demo users
- `is_demo = true`
- Seed script creates demo profile + sample logs + sample assessment
- Reset demo script deletes/reinserts only `is_demo` rows

### Admin / researcher
- Prefer service role key **only on server** for seed/reset
- No participant can list other users

### Passwords
- Handled by Supabase Auth (hashed)
- Never store plaintext passwords
- Never send passwords to LLM or Make.com

---

## 6. Derived / computed fields

| Field | Where computed |
|-------|----------------|
| Age | From DOB at registration and when needed |
| BMI | On profile save; copy onto assessment |
| Cycle length / next period | Service function from `menstrual_logs` |
| Risk score | Rule engine pure function → `risk_assessments` |

---

## 7. API surface (logical)

| Action | Auth | Notes |
|--------|------|-------|
| POST signup/login | public | Supabase auth |
| GET/PATCH profile | user | onboarding fields |
| POST consents | user | |
| CRUD menstrual logs | user | online only |
| POST screening | user | runs rules server-side or trusted client + server verify |
| GET assessments | user | history |
| POST ai message | user | server proxies to Groq/Gemini |
| PATCH notification prefs | user | |
| POST make webhook emit | server | signed |
| POST demo reset | service role / protected | demo only |

**Recommendation:** Run rule engine on **server** (Edge Function) so clients cannot tamper with category.

---

## 8. Make.com payload (example)

```json
{
  "eventType": "missed_tracking_reminder",
  "userId": "uuid",
  "email": "user@example.com",
  "mobile": "+63...",
  "channels": ["email", "sms"],
  "templateKey": "missed_log_v1",
  "data": {
    "firstName": "Ana",
    "lastPeriodStart": "2026-06-01"
  },
  "timestamp": "2026-07-13T00:00:00Z"
}
```

Do **not** send full medical history blobs unless required for the template.

---

## 9. AI context payload (minimized)

```json
{
  "ageBand": "18-24",
  "bmi": 24.6,
  "latestRisk": {
    "category": "Moderate",
    "score": 8,
    "factors": ["Irregular cycles", "Acne", "Family history"]
  },
  "cycleSummary": {
    "logsCount": 3,
    "avgLength": 38,
    "irregular": true
  },
  "userMessage": "Can you explain my result?"
}
```

Avoid: full name in prompts if not needed; never password; minimize free-text meds if sensitive.

---

## 10. Retention

| Data | Policy |
|------|--------|
| Active account data | Kept while account exists |
| Anonymization pipeline | Not required for MVP |
| Deletion request | Delete profile cascade + auth user (document process) |
| Demo data | Resettable anytime |

---

## 11. Migrations / seed

1. Create tables + RLS  
2. Seed enum-like check constraints as needed  
3. Seed demo user + sample data  
4. Seed consent policy version constant in app config  

---

## 12. Open items

| ID | Topic | Default |
|----|--------|---------|
| D1 | Supabase vs Firebase | **Supabase** |
| D2 | Server-side scoring | **Yes** |
| D3 | Soft-delete vs hard-delete | Hard delete on request for MVP |
| D4 | Multi-device sessions | Supabase default sessions OK |

---

## Next

`06-tech-stack.md` for frameworks, hosting, AI provider pick, Make.com wiring.
