# 09 â€” UX & Information Architecture

**Status:** Decisions updated — mobile-first; grouped screening quiz OK  
**Last updated:** 2026-07-13  
**Depends on:** `01`, `03`, `08`

---

## 1. UX principles

1. **Phone-first** — design for ~360–430px first. **Capstone UI is the mobile experience**; desktop is wider single column only.
2. **One job per screen** during onboarding/screening  
3. **Forced onboarding** â€” clear progress, no skip  
4. **Trust & calm** â€” disclaimers visible but not terrifying  
5. **Explainability** â€” risk factors shown in plain language  
6. **Fast demo path** â€” demo account reaches value in minutes  

---

## 2. Navigation (authenticated, onboarded)

**Mobile bottom nav (5 items):**

| Tab | Route | Purpose |
|-----|-------|---------|
| Home | `/home` | Insights, CTAs |
| Cycle | `/cycle` | Log + history |
| Screen | `/screen` | PCOS risk questionnaire + history |
| Assistant | `/assistant` | AI chat |
| Profile | `/profile` | Account, prefs, consents |

Unauthenticated: Landing, Login, Register only.

---

## 3. Sitemap

```text
/                       Landing
/login
/register
/consent                (or embedded in register)
/onboarding/[step]      Forced wizard
/home
/cycle
/cycle/new
/cycle/[id]/edit
/screen
/screen/quiz
/screen/result/[id]
/assistant
/assistant/[conversationId]
/profile
/profile/notifications
/help                   Disclaimers + urgent care info
/demo                   Protected demo launcher (optional)
```

---

## 4. Key screens (wireframe-level)

### 4.1 Landing
- Product name + one-liner  
- â€œNot a diagnosisâ€ badge  
- Primary CTA: Get started  
- Secondary: Log in  
- Short feature row: Track Â· Screen Â· Learn Â· Refer  

### 4.2 Register / Login
- Email, password  
- DOB on register  
- Age block error state  
- Link to privacy/disclaimer  

### 4.3 Consent
- Checkboxes (required)  
- Expandable details  
- Guardian block if age 12â€“17  
- Continue disabled until complete  

### 4.4 Onboarding wizard
Progress indicator (Step x of 5)

1. Physical â€” height, weight, optional waist, live BMI  
2. Family history â€” chips/checkboxes + None  
3. Medical & meds â€” chips + optional text  
4. Lifestyle â€” activity, sleep, stress, smoking/alcohol  
5. Review â€” summary cards â†’ Confirm  

No skip. Back allowed. Save on each step if possible.

### 4.5 Home
- Greeting + disclaimer strip  
- Cards:
  - Latest risk category (or CTA to screen)  
  - Cycle snapshot / next estimate  
  - Log period CTA  
  - Ask Assistant CTA  
- If Moderate/High latest: referral reminder card  

### 4.6 Cycle
- List/calendar of logs  
- FAB / button: Log period  
- Insights: avg length, irregular flag, next estimate  
- Empty state: â€œLog your first period start dateâ€  

### 4.7 Log period form
- Start date (date picker)  
- Duration, flow, pain, notes  
- Save  
- Offline/network error toast  

### 4.8 Screen hub
- Intro copy + disclaimer  
- Start screening  
- Past results list  

### 4.9 Questionnaire
- **Grouped pages OK** (≈3–4 questions per screen; not forced one-per-page)
- Yes/No large full-width tap targets
- Progress: group / total (or answered N of 12)
- Review page, then submit

### 4.10 Result
- Category badge color:
  - Low: calm green/teal  
  - Moderate: amber  
  - High: deep coral (not panic red if possible)  
- Score optional for transparency (e.g. 8/20)  
- Contributing factors list  
- Disclaimer  
- If Moderate/High: Referral checklist section expanded by default  
- Buttons: Explain with AI Â· Back to Home Â· Log cycle  

### 4.11 Assistant
- Disclaimer pinned at top  
- Suggested prompts chips  
- Chat bubbles  
- Composer  
- â€œAbout this answerâ€ note: educational only  

### 4.12 Profile
- Edit baseline fields  
- Notification prefs (email/SMS toggles)  
- View consents  
- Logout  
- Help / About  

### 4.13 Demo launcher (team)
- Login as demo  
- Reset demo data  
- Jump links to result / AI  

---

## 5. Visual direction (lightweight)

| Token | Suggestion |
|-------|------------|
| Personality | Soft clinical + friendly youth health |
| Primary | Teal / soft violet (trust + calm) |
| Background | Light neutral |
| Typography | Clear sans (e.g. Inter) |
| Radius | Rounded cards (12â€“16px) |
| Imagery | Abstract wellness, avoid sexy/stock clichÃ©s |

Accessibility: contrast WCAG AA where practical; donâ€™t rely on color alone for risk category (include text label).

---

## 6. Empty / error / online-required

| State | Message pattern |
|-------|-----------------|
| No period logs | Encourage first log; screening still available |
| No screening yet | CTA start screening |
| AI down | Fallback text + retry |
| Network error on save | â€œConnection required to save. Please try again.â€ |
| Age blocked | Explain eligible ages 12â€“24 |

---

## 7. Demo UX script (UI order)

1. Landing  
2. Demo login  
3. Home with sample insights  
4. Cycle history  
5. Open past Moderate result **or** run quiz  
6. Referral checklist  
7. AI explain  
8. Profile notification prefs mention Make.com  

---

## 8. Component inventory (build list)

- App shell + bottom nav  
- Progress wizard  
- Checkbox group + â€œNoneâ€ exclusivity  
- BMI readout  
- Period log form  
- Risk badge  
- Factor list  
- Referral checklist  
- Chat UI  
- Disclaimer banner  
- Loading skeletons  
- Toast/alerts  

---

## 9. Open items

| ID | Topic | Default |
|----|--------|---------|
| U1 | Brand colors final | Teal/violet draft |
| U2 | Tagalog UI | Later |
| U3 | Dark mode | Later |
| U4 | Question one-per-page vs grouped | **Grouped OK** (≈3–4 / page) |

---

## Next

`10-success-metrics.md` for definition of done and capstone evaluation metrics.


