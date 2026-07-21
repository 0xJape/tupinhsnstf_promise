# 11 — Website Components Catalog

**Status:** Decisions locked for implementation
**Last updated:** 2026-07-13  
**Depends on:** `06-tech-stack.md`, `09-ux-ia.md`, `08-clinical-content.md`  
**Purpose:** Implementation-ready list of UI components, where they live, props, and which screens use them.

---

## 1. Component architecture

```text
src/components/
  ui/              # shadcn primitives (button, input, card, …)
  layout/          # app chrome: shell, nav, headers
  auth/            # login, register, consent
  onboarding/      # forced wizard steps
  cycle/           # period logs + insights
  screening/       # quiz, result, referral
  assistant/       # AI chat
  profile/         # account + notification prefs
  shared/          # cross-cutting: disclaimer, empty, loading
```

### Rules

1. **`ui/`** = dumb primitives only (no product business logic).  
2. **Feature folders** = compose `ui/` + domain behavior.  
3. Prefer **Server Components** for pages that only read data; mark interactive pieces `"use client"`.  
4. Forms use **React Hook Form + Zod** schemas from `src/lib/validations`.  
5. Copy for clinical text comes from constants aligned with `08-clinical-content.md` (not hard-coded randomly in 10 places).

---

## 1.1 Mobile-first component rules (LOCKED)

| Rule | Detail |
|------|--------|
| Primary viewport | 360–430px |
| App shell width | `max-w-lg` mx-auto on large screens (phone frame feel) |
| Screening | **Grouped pages OK** (≈3–4 Yes/No per screen; still large touch targets) |
| Bottom nav | Always thumb-reachable; hide on quiz focus mode optional |
| Sticky actions | Primary CTA bottom-safe-area on forms/quiz |
| No hover-only | Every action works with tap |

---

## 2. Design tokens (MVP)

| Token | Value / guidance |
|-------|------------------|
| Primary | Teal (`~ teal-600`) |
| Accent | Soft violet (CTAs secondary) |
| Risk Low | Teal/green text + badge |
| Risk Moderate | Amber |
| Risk High | Deep coral (avoid pure panic red) |
| Radius | 12–16px cards |
| Font | Inter (or system UI sans) |
| Touch target | min ~44px height for primary controls |
| Max content width (phone) | full width with `px-4`; desktop center `max-w-lg` or `max-w-xl` for app shell |

---

## 3. shadcn `ui/` primitives to install first

| Component | Used for |
|-----------|----------|
| `Button` | All primary/secondary actions |
| `Input` | Email, password, numbers, text |
| `Label` | Form labels |
| `Textarea` | Notes, meds free text |
| `Card` (+ Header/Content/Footer) | Home tiles, result blocks |
| `Checkbox` | Consents, multi-select history |
| `RadioGroup` | Yes/No groups if not custom |
| `Select` | Lifestyle bands, flow |
| `Slider` | Pain / stress (optional) |
| `Badge` | Risk category, tags |
| `Progress` | Onboarding + quiz progress |
| `Dialog` / `AlertDialog` | Confirm delete log, age block |
| `Sheet` | Optional mobile drawers |
| `Tabs` | Profile sections (optional) |
| `Toast` (sonner) | Save success/errors |
| `Skeleton` | Loading states |
| `Separator` | Visual breaks |
| `Switch` | Notification toggles |

---

## 4. Layout components

### `AppShell`
- **Path:** `components/layout/AppShell.tsx`  
- **Use:** Authenticated layout wrapper  
- **Contains:** top bar (optional title), `children`, `BottomNav`  
- **Props:** `title?: string`, `showNav?: boolean` (hide on onboarding if needed)

### `BottomNav`
- **Path:** `components/layout/BottomNav.tsx`  
- **Tabs:** Home · Cycle · Screen · Assistant · Profile  
- **Behavior:** highlight active route; icons + labels; safe-area padding for phones  

### `PageHeader`
- **Props:** `title`, `subtitle?`, `backHref?`  
- **Use:** Cycle new, quiz, result, settings subpages  

### `PublicShell`
- **Use:** Landing, login, register (no bottom nav)  
- Centered column, brand mark, footer disclaimer link  

---

## 5. Shared / cross-cutting

| Component | Responsibility | Key props |
|-----------|----------------|-----------|
| `DisclaimerBanner` | Non-diagnosis strip | `variant: "compact" \| "full"`, `className?` |
| `DisclaimerModal` | First-run / screening intro detail | `open`, `onAccept` |
| `EmptyState` | No logs / no assessments | `icon?`, `title`, `description`, `action?` |
| `ErrorState` | Failed fetch/save | `message`, `onRetry?` |
| `OnlineRequiredToast` | Network error on mutation | triggered via toast helper |
| `LoadingBlock` | Section skeleton | `rows?` |
| `ConfirmDialog` | Destructive confirm | `title`, `description`, `onConfirm` |
| `InfoCallout` | Soft tips / age notes | `tone: "info" \| "warning" \| "urgent"` |
| `ExternalHelpLinks` | Urgent care copy | static from `08` |

**Placement rules**
- `DisclaimerBanner` on: landing, screening intro, result, assistant, referral block  
- `InfoCallout` tone `urgent` only for emergency messaging  

---

## 6. Auth components

| Component | Screen | Notes |
|-----------|--------|-------|
| `LoginForm` | `/login` | email, password → Supabase |
| `RegisterForm` | `/register` | email, password, DOB; age gate 12–24 |
| `AgeBlockedMessage` | register error | explains eligibility |
| `ConsentForm` | `/consent` | required checkboxes; guardian block if 12–17 |
| `ConsentCheckbox` | consent | label + expandable detail |
| `PasswordField` | auth forms | show/hide toggle |

### `ConsentForm` required items (from `08`)
1. Non-diagnosis  
2. Health data storage  
3. AI third-party  
4. Notifications  
5. Research framing  
6. Guardian + assent if minor  

Continue **disabled** until all required true.

---

## 7. Onboarding components

| Component | Step | Fields / behavior |
|-----------|------|-------------------|
| `OnboardingProgress` | all | Step x of 5 + Progress bar |
| `PhysicalStep` | 1 | height_cm, weight_kg, waist_cm optional, live `BmiReadout` |
| `BmiReadout` | 1 + profile | shows BMI + band label |
| `FamilyHistoryStep` | 2 | chip multi-select + **None** exclusivity |
| `MedicalStep` | 3 | conditions chips + medications text |
| `LifestyleStep` | 4 | activity, sleep, stress, smoking, alcohol |
| `ReviewStep` | 5 | summary cards → Confirm |
| `ChipMultiSelect` | 2–3 | `options`, `value`, `onChange`, `noneOption?` |
| `WizardNav` | all | Back / Continue; no Skip |

**Forced:** cannot reach `(app)` routes until `onboarding_complete = true`.

---

## 8. Home components

| Component | Content |
|-----------|---------|
| `HomeGreeting` | Hello + first name |
| `RiskSummaryCard` | Latest category badge or CTA “Take screening” |
| `CycleSnapshotCard` | Avg length / next estimate / irregular flag |
| `QuickActions` | Log period · Start screen · Ask assistant |
| `ReferralReminderCard` | Only if latest Moderate/High |
| `HomeDisclaimer` | compact banner |

---

## 9. Cycle components

| Component | Responsibility |
|-----------|----------------|
| `CycleInsightsBar` | avg length, irregular, next estimate, confidence |
| `MenstrualLogList` | chronological cards |
| `MenstrualLogCard` | start date, duration, flow, pain; edit link |
| `MenstrualLogForm` | create/edit: start_date, duration_days, flow, pain_level, notes |
| `FlowSelect` | light / medium / heavy |
| `PainPicker` | 0–10 or 1–5 scale (pick one in impl; default **0–10**) |
| `LogPeriodFab` | sticky primary on `/cycle` |
| `CycleEmptyState` | first-log CTA; note screening still available |

### Form validation (Zod sketch)

```ts
menstrualLogSchema = {
  start_date: date required (not future beyond +1 day grace)
  duration_days: int 1–15 optional
  flow: enum optional
  pain_level: int 0–10 optional
  notes: string max 500 optional
}
```

---

## 10. Screening components

| Component | Responsibility |
|-----------|----------------|
| `ScreenHub` | intro copy, Start CTA, history list |
| `ScreeningIntro` | educational blurb + disclaimer |
| `AssessmentHistoryList` | past results → open result |
| `AssessmentHistoryItem` | date, category badge, score |
| `QuizProgress` | Group N of M / answered N of 12 (percent bar) |
| `QuizGroup` | **3–4 questions per page** — list of prompts + Yes/No + Back/Next |
| `QuizQuestion` | Single prompt row inside a group |
| `YesNoToggle` | accessible radio-like control, min 44px |
| `QuizReview` | summary of answers before submit |
| `SubmitScreeningButton` | calls `/api/screening` |
| `RiskBadge` | Low / Moderate / High + color tokens |
| `ScoreMeter` | optional “8 / ~20” transparency |
| `FactorList` | contributing factors sorted by points |
| `FactorItem` | label + points |
| `ResultSummary` | badge + score + short category copy from `08` |
| `ReferralChecklist` | checklist + visit questions; **default open** if Moderate/High |
| `ResultActions` | Explain with AI · Home · Log cycle |

### `RiskBadge` API

```ts
type RiskCategory = "Low" | "Moderate" | "High"
props: { category: RiskCategory; size?: "sm" | "md" | "lg" }
```

### Quiz flow (LOCKED — grouped pages OK)

Mobile-first still: large Yes/No, short pages. **Grouping ≈3–4 questions per screen is fine** (user OK with this).

| Step | Content |
|------|---------|
| 0 | Screening intro + disclaimer → Start |
| 1 | Group A: Q1–Q3 (cycle symptoms) |
| 2 | Group B: Q4–Q6 (skin/hair) |
| 3 | Group C: Q7–Q9 (weight / acanthosis / family PCOS) |
| 4 | Group D: Q10–Q12 (family T2DM / cysts / hormonal meds meta) |
| 5 | Review all answers → Submit |
| 6 | Result screen |

**Why group?** Fewer taps through 12 items; still phone-friendly if each Yes/No is large and groups stay short. One-per-screen optional later if user testing says so.

**Interaction**
- Tap Yes or No per item (≥ 44px)
- Next disabled until group complete (or allow skip only if product says required)
- Back allowed; answers retained in client state until submit
- Progress: `Group 2 of 4` or `6 of 12 answered`


---

## 11. Assistant (AI) components

| Component | Responsibility |
|-----------|----------------|
| `AssistantDisclaimer` | pinned top |
| `SuggestedPrompts` | chip row (“Explain my result”, “What is PCOS screening?”, …) |
| `ChatThread` | scrollable messages |
| `ChatBubble` | user vs assistant styles |
| `ChatComposer` | textarea + send; disable while pending |
| `ModelMetaNote` | “Educational only · model: …” optional subtle |
| `AiErrorFallback` | shows template text + Retry |

**Never** show raw system prompt.  
Streaming optional for MVP (non-streaming OK first).

---

## 12. Profile components

| Component | Responsibility |
|-----------|----------------|
| `ProfileHeader` | name, age, email |
| `ProfileEditForm` | baseline fields (reuse onboarding field groups) |
| `NotificationPrefsForm` | switches: email, SMS, period, missed, risk, education |
| `ConsentRecordView` | read-only accepted consents + dates |
| `LogoutButton` | Supabase signOut |
| `AboutCard` | product one-liner + non-diagnosis |

---

## 13. Demo components (team / defense)

| Component | Responsibility |
|-----------|----------------|
| `DemoBanner` | “Demo account” strip when `is_demo` |
| `DemoResetButton` | calls `/api/demo/reset` (protected) |
| `DemoQuickLinks` | jump to sample result / AI |

---

## 14. Screen → component map

| Screen | Primary components |
|--------|--------------------|
| Landing | `PublicShell`, hero, feature row, `DisclaimerBanner`, CTAs |
| Login | `PublicShell`, `LoginForm` |
| Register | `PublicShell`, `RegisterForm`, `AgeBlockedMessage` |
| Consent | `ConsentForm`, `ConsentCheckbox` |
| Onboarding | `OnboardingProgress`, step components, `WizardNav` |
| Home | `AppShell`, greeting, risk/cycle cards, quick actions |
| Cycle list | `CycleInsightsBar`, `MenstrualLogList`, FAB |
| Log form | `PageHeader`, `MenstrualLogForm` |
| Screen hub | `ScreeningIntro`, history, Start |
| Quiz | `QuizProgress`, `QuizGroup`, `YesNoToggle`, review |
| Result | `ResultSummary`, `FactorList`, `ReferralChecklist`, actions |
| Assistant | disclaimer, prompts, `ChatThread`, composer |
| Profile | edit form, prefs, consent view, logout |
| Help | full disclaimer + urgent care `InfoCallout` |

---

## 15. Build priority (matches eng order)

### P0 — shell & auth
`ui/*` basics · `PublicShell` · `LoginForm` · `RegisterForm` · `AppShell` · `BottomNav` · `DisclaimerBanner`

### P1 — onboarding
`OnboardingProgress` · `PhysicalStep` + `BmiReadout` · history/medical/lifestyle steps · `ReviewStep` · `ChipMultiSelect`

### P2 — cycle
`MenstrualLogForm` · list/card · `CycleInsightsBar` · empty state

### P3 — screening
`YesNoToggle` · `QuizGroup` · progress · `RiskBadge` · `FactorList` · `ResultSummary` · `ReferralChecklist`

### P4 — assistant
`ChatThread` · composer · suggested prompts · fallback

### P5 — profile + demo
prefs switches · consent view · demo banner/reset

---

## 16. State & data patterns

| Concern | Pattern |
|---------|---------|
| Auth session | Supabase SSR; middleware |
| Server data | RSC fetch + revalidatePath after mutations |
| Forms | RHF + Zod; disable submit while pending |
| Toasts | success/error only (not for every navigation) |
| Optimistic UI | optional for logs; not for screening score |
| Caching | don’t cache AI answers as medical truth |

---

## 17. Accessibility checklist

- [ ] Risk category always has **text**, not color alone  
- [ ] Yes/No and nav targets ≥ 44px  
- [ ] Form fields have labels  
- [ ] Errors announced (aria-live or linked messages)  
- [ ] Focus visible on controls  
- [ ] Dialogs trap focus  
- [ ] Contrast AA for body text and badges where practical  

---

## 18. File naming conventions

- Components: `PascalCase.tsx`  
- Colocate small helpers next to feature if not shared  
- One primary export per component file  
- Tests: only for pure logic in `lib/` for MVP (component tests optional)

---

## 19. Open items

| ID | Topic | Default |
|----|--------|---------|
| C1 | Pain scale 0–10 vs 1–5 | **0–10** |
| C2 | Quiz one-per-page vs grouped | **Grouped OK** (≈3–4 / page) |
| C3 | AI streaming | Off for MVP |
| C4 | Icon set | `lucide-react` (shadcn default) |
| C5 | Dark mode | Later |

---

## 20. Related docs

- Screens & IA → `09-ux-ia.md`  
- Copy → `08-clinical-content.md`  
- Stack & folders → `06-tech-stack.md`  
- Scoring display data → `04-rule-engine.md`  

---

## Next

Approve `06` + `11`, then scaffold the Next.js app and implement **P0** components first.


