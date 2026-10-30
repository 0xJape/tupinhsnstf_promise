# PROMISE Implementation Plan

Purpose: deliver approved enhancements in small, testable releases. Plan avoids claims of diagnosis, clinical validation, or automatic emergency assessment.

## Delivery rules

- Keep PROMISE educational, self-tracking, and care-navigation software.
- Store only data needed for each feature.
- Make consent, privacy, deletion, and opt-out visible.
- Use verified content and mark unverified content clearly.
- Ship one feature slice at a time.
- Test locally before moving to next phase.
- Do not describe planned work as complete.

## Phase 0 — Foundation and safety baseline

**Status:** Mostly complete.

Confirm before new feature work:

- Authentication, consent, profile, and RLS work locally.
- Medical and AI disclaimers appear at relevant points.
- Emergency support shows `911`, NCMH `1553`, trusted contact, and Help Center.
- Error states do not expose private data.
- Existing data can be deleted by its owner.

**Exit check:** local build, focused tests, and manual navigation pass.

## Phase 1 — Emergency and emotional support

**Status:** Implemented baseline; refine only where needed.

- Keep quick-access emergency actions.
- Keep supportive, non-clinical language.
- Add verified local resources only after source review.
- Do not auto-contact trusted contacts without explicit user action.
- Add accessible labels and usable phone links.

**Exit check:** support actions work on mobile and no copy implies diagnosis or treatment.

## Phase 2 — Symptom Journey and Symptom Mapping

**Status:** Not started as full feature. Daily wellness logs are the current foundation.

### 2.1 Data model

Add owner-scoped symptom records with:

- symptom type, including custom symptom
- body area
- date of occurrence
- severity
- frequency
- duration
- change: improved, same, worsened
- personal note
- created and updated timestamps

Use database constraints, RLS, indexes, and deletion support. Keep symptom records separate from screening conclusions.

### 2.2 Tracking UI

Add a simple symptom entry form first:

- Choose symptom
- Choose body area or use a simple body-area list
- Enter details
- Save, edit, and delete own record

Add visual body-map interaction only after the basic form works. Do not block tracking on an illustration.

### 2.3 Journey view

Add a Health Journey page showing:

- chronological symptom records
- severity and change labels
- notes
- empty, loading, and error states
- date filtering

Use wording such as “You recorded…” and “Your entries show…”. Do not infer medical causes.

### 2.4 Comparison and cycle context

Add comparison for one or two selected symptoms. Add cycle-date context only when data exists.

Allowed wording:

- “You recorded acne during your recent menstrual period.”
- “These entries show different recorded severity levels.”

Avoid causal wording such as “your cycle caused acne.”

### 2.5 Questions and report input

Allow users to save questions for a healthcare professional. Let users choose which symptom records and questions to include in a future report.

**Exit check:** create, view, edit, delete, filter, and compare records; RLS blocks another user; safety wording passes review.

## Phase 3 — Personalized health-summary report

**Status:** Planned.

Build after Phase 2 data stabilizes.

- Select date range and records.
- Include recorded symptoms, wellness data, cycle information, screening results, notes, questions, and referral information where available.
- Generate a clear on-screen summary first.
- Add downloadable format after content is stable.
- Label report as user-recorded information, not diagnosis.

**Exit check:** report contains only selected, authorized user data and handles empty sections safely.

## Phase 4 — Location-based healthcare mapping

**Status:** Baseline directory and MapLibre map exist; expand carefully.

- Define facility schema and verification status.
- Support hospitals, OB-GYN clinics, RHUs, women’s health centers, laboratories, and other verified facilities.
- Add address, contact, hours, services, latitude, longitude, and verification date.
- Support manual location search first.
- Add optional approximate browser location only with permission.
- Show distance only when coordinates and user permission allow it.
- Keep directions as an external link.
- Add save facility only after ownership and privacy rules are defined.

**Exit check:** map remains usable without location permission; stale or unverified facilities are visibly marked.

## Phase 5 — PCOS education and manifestation explorer

**Status:** Planned.

- Organize content into menstrual/reproductive, hormonal, dermatologic, and metabolic areas.
- Use reviewed educational copy.
- Explain that one manifestation does not confirm PCOS.
- Link to tracking without turning education into self-diagnosis.
- Keep content versioned so updates can be reviewed.

**Exit check:** every section has source/review metadata and safety disclaimer.

## Phase 6 — Patient stories

**Status:** Planned.

- Start with written stories, not video infrastructure.
- Add submission consent and publication consent separately.
- Support anonymous publication and removal requests.
- Exclude identifying or sensitive details unless explicitly approved.
- Label stories as lived experience, not medical advice.
- Add moderation before publication.

**Exit check:** unpublished submissions are private; published stories have consent and moderation records.

## Phase 7 — Notifications

**Status:** Preferences and reminder foundation exist; active delivery is not complete.

- Finish in-app notification status first.
- Add reminder types and quiet hours.
- Require explicit opt-in for SMS.
- Verify phone number before SMS delivery.
- Add opt-out and failure status.
- Start with symptom and menstrual reminders.
- Add referral and appointment reminders only when corresponding data exists.
- Add language selection only when translated content exists.

**Exit check:** opt-in, opt-out, quiet hours, and failed delivery behave correctly. Never send sensitive content without appropriate consent.

## Phase 8 — Feedback and evaluation

**Status:** Planned.

- Add short feature-level feedback form.
- Capture rating, helpfulness, accessibility, and optional comment.
- Do not collect unnecessary health details in feedback.
- Keep feedback separate from clinical records.
- Restrict admin access and record audit events.

**Exit check:** users can submit, withdraw where required, and receive confirmation without seeing other users’ feedback.

## Phase 9 — Professional validation and operations

**Status:** Admin foundation exists; validation process is planned.

- Create reviewer register: name, role, organization, date, area, findings, recommendations.
- Review medical content, screening, referrals, emergency copy, AI boundaries, mapping, accessibility, and privacy.
- Store evidence securely with restricted access.
- Mark reviewed content with review date and version.
- Never call the product clinically validated without an appropriate study.

**Exit check:** each reviewed area has documented evidence, owner, status, and next review date.

## Recommended order

1. Confirm Phase 0 and Phase 1 safety baseline.
2. Build Phase 2 symptom records and journey view.
3. Build Phase 3 report from stable Phase 2 data.
4. Complete Phase 4 directory verification and location behavior.
5. Add Phase 5 education.
6. Add Phase 7 in-app notifications, then SMS only after consent and delivery controls.
7. Add Phase 8 feedback.
8. Add Phase 6 stories after moderation exists.
9. Complete Phase 9 professional review and operational evidence.

## Definition of done for each phase

- Scope matches this plan.
- UI, server actions, schema, and RLS agree.
- Loading, empty, error, and permission states exist.
- Accessibility and safety copy reviewed.
- Focused tests pass locally.
- Manual happy path and misuse path checked.
- Documentation states what is complete and what remains.
