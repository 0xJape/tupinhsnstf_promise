# P.R.O.M.I.S.E. Admin Operations Guide

Status: **Proposed implementation source of truth — approve before coding**  
Scope: narrow research and referral operations portal, not clinician/EHR product.

## 1. Product decision

Use existing Supabase Auth. Do **not** build second password/login system.

- Participants continue through `/login`.
- Admins may use `/admin/login`, but it authenticates against same Supabase Auth.
- Active database membership decides admin access after authentication.
- Admin pages use separate responsive desktop shell. Reuse UI primitives and visual language, not participant phone-width `AppShell` or bottom navigation.
- Screening remains educational and cannot diagnose, prescribe, triage emergencies, or rank treatment urgency.

## 2. MVP roles

Only two roles:

| Role | Can access |
|---|---|
| `research_admin` | Aggregate dashboard, participant operations list/detail, consent status, screening snapshots, referral cases, approved corrections, audit trail |
| `referral_staff` | Referral queue and minimum contact/screening packet needed for follow-up |

Neither role can browse AI conversations, raw daily notes, or unrelated private health data.

Role authority must live in `admin_memberships`, never browser state, request body, `profiles`, or editable user metadata.

```sql
admin_memberships (
  user_id uuid primary key references auth.users(id),
  role text check (role in ('research_admin', 'referral_staff')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
)
```

Initial admins are seeded through controlled SQL. No public role-registration UI.

## 3. Admin information architecture

### `/admin`

Dashboard with real aggregate data only:

- Eligible participants.
- Current-policy consent rate.
- Onboarding completion rate.
- Participants with baseline screening.
- Assessment category distribution.
- Open referral cases.
- Failed notification events.
- Active participants in selected real date window.

### `/admin/participants`

Paginated operations list with search and bounded filters.

Default columns:

- Study ID / shortened participant ID.
- Name for `research_admin` only.
- Age band: `12–17` or `18–24`; no exact DOB in list.
- Onboarding status.
- Current consent status and policy version.
- Baseline assessment date and category.
- Rule version.
- Data completeness band.
- Latest period-log date.
- Latest wellness check-in date.
- Referral status.
- Delivery problem flag.

Do not show email, mobile, BMI, weight, raw answers, notes, AI messages, conditions, medication, guardian details, or notification payload in list.

### `/admin/participants/[id]`

Least-privilege detail sections:

1. Participant overview.
2. Current consent status.
3. Immutable baseline screening snapshot.
4. Cycle/wellness activity dates and counts—not raw notes by default.
5. Referral cases.
6. Correction history.
7. Audit references.

Email/mobile stays masked unless `research_admin` performs explicit **Reveal contact** action or referral staff opens assigned case. Reveal must be audited.

### `/admin/referrals`

Queue with status, assignment, callback preference, notification state, and minimum patient packet.

### `/admin/audit`

`research_admin` only. Filterable append-only operational audit events. No edit/delete UI.

## 4. “Current situation” rules

Derive server-side from current records. Do not store another mutable profile label in MVP.

Priority:

1. `Referral open` — active referral case exists.
2. `Elevated result, referral not requested` — valid Moderate/High baseline without patient referral request.
3. `Follow-up delivery failed` — related notification failed.
4. `Setup incomplete` — onboarding or current-policy consent incomplete.
5. `Screening follow-up due` — only after approved study interval exists.
6. `Tracking inactive` — only after approved inactivity window exists.
7. `Current` — no operational blocker.
8. `Never screened` — no valid baseline.

Never label participant “urgent,” “diagnosed,” “needs treatment,” or “non-compliant.” Stored evidence does not support those claims.

## 5. One-time baseline screening

First completed screening becomes immutable baseline pre-assessment.

After completion:

- Screen hub replaces **Start quiz** with **Baseline completed**.
- Show completion date, risk category, **View baseline**, and **Report a mistake**.
- UI, API, and database each block second active baseline.
- API returns `409 Conflict` with existing baseline ID.
- Original answers, score, profile-derived modifiers, factors, rule version, and completion date stay immutable.

Future screening is separate `follow_up`, never overwrite/retake. Follow-up remains out of first admin MVP until interval and research protocol are approved.

Suggested assessment metadata:

```text
assessment_type: baseline | follow_up
record_status: valid | superseded | void
supersedes_assessment_id
source: participant | admin_correction
correction_reason
created_by
```

Database must enforce one active `baseline` per user with partial unique index.

## 6. Screening mistake/correction workflow

Participant action: **Report a mistake**.

Reasons:

- Incorrect answer.
- Wrong profile information.
- Submitted accidentally.
- Technical problem.

Admin workflow:

1. Open request.
2. Compare immutable assessment and request reason.
3. Reject with explanation, or start correction.
4. Copy original answers into correction form.
5. Change only verified fields.
6. Server reruns selected rule version.
7. Insert new assessment snapshot.
8. Mark original superseded—never mutate/delete it.
9. Audit actor, reason, original ID, replacement ID, and changed fields.
10. Keep existing referral historically linked; score reduction never silently deletes case.

Destructive **Void baseline** requires typed reason and participant study ID confirmation. Voiding does not delete record. It permits one new participant baseline.

## 7. Referral workflow

Persist case before sending Make event:

```text
Patient consents and submits
→ referral case created
→ care-desk notification queued
→ new
→ contacting
→ completed | unable_to_contact | declined | closed
```

Minimal `referral_cases` fields:

```text
id, user_id, assessment_id, status, patient_note,
preferred_call_at, time_zone, assigned_to,
created_at, updated_at, last_contact_at, closed_at
```

Rules:

- One active case per assessment.
- Patient opt-in creates case transactionally before notification.
- Notification failure leaves case available for retry.
- Assignment, status, retry, contact reveal, and closure require audit.
- Callback time is preference—not appointment guarantee.
- No diagnosis, clinical notes, prescriptions, treatment plan, or appointment booking.

## 8. Dashboard charts

No new chart dependency for MVP. Use native CSS/SVG, existing Card/Badge styles, `lucide-react`, and `date-fns`.

Required charts:

1. **Latest baseline category distribution** — Low/Moderate/High participant counts.
2. **Baseline completions over time** — daily/weekly real counts.
3. **Onboarding funnel** — registered → current consent → onboarding complete → baseline complete → referral opted-in.
4. **Referral status distribution** — after `referral_cases` exists.
5. **Notification outcomes** — queued/webhook accepted/failed. Never call webhook acceptance “delivered.”
6. **Data completeness distribution** — reuse deterministic completeness logic and label it **Data completeness**, not clinical confidence.

Chart requirements:

- Visible title, date range, unit, legend, and source definition.
- Text/table equivalent for accessibility.
- No fake values, predictions, interpolated trend, diagnosis rate, or treatment outcome.
- Suppress/merge filtered cells below approved privacy threshold; default proposal `<5`.
- Empty state says no matching records—not zero health risk.
- Loading uses skeleton; load failure uses persistent retry panel.

## 9. Shared UI and admin shell

Reuse:

- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/sonner.tsx`
- `src/components/shared/BrandLogo.tsx`
- Existing theme tokens in `src/app/globals.css`

Create separate admin shell:

- Desktop sidebar at `lg`.
- Compact top bar with page title, role badge, theme toggle, and account menu.
- Mobile drawer for navigation.
- Main width around `max-w-7xl`; do not inherit participant `max-w-lg`.
- Tables collapse into labeled rows/cards on narrow screens.
- Filters remain URL-backed so refresh/back preserve state.

Avoid excessive glass, decorative 3D, dense card grids, or AI-generated summaries. Admin UI prioritizes scanning, provenance, and action state.

## 10. Modal and error UX

Use modal only for focused mutation or consequence review.

### Modal actions

- Assign referral.
- Change referral status.
- Close referral.
- Retry failed notification.
- Correct screening.
- Void baseline.
- Require participant re-baseline.
- Reveal contact details.

### Pattern

1. Clear action title.
2. Participant study ID and relevant record ID.
3. Exact consequences.
4. Required reason for sensitive mutations.
5. Inline validation beside field.
6. Disabled submit while pending.
7. Preserve values after recoverable server failure.
8. API error appears inside modal with stable reference ID.
9. Success closes modal and shows toast.
10. Destructive actions use second confirmation and explicit wording; never rely on color alone.

Use:

- Inline errors for fields.
- Toast for successful non-destructive action.
- Persistent page alert for failed page/chart load or failed webhook.
- Empty-state action for no records.
- Retry without losing filters or modal input.

Never display stack traces, SQL errors, secrets, or full notification payloads.

## 11. Authorization and privacy

- `/admin/*` server layout verifies authenticated active membership on every request.
- `/api/admin/*` independently verifies membership and required role.
- UI visibility is never authorization.
- Zod validates request bodies.
- Actor ID comes from session, never request body.
- Identifiable admin responses use private/no-store behavior.
- All lists use pagination and bounded filters.
- Exports require `research_admin`, explicit purpose, audit event, and later protocol approval.
- Admin RLS uses stable security-definer role helper with locked `search_path`.
- Service role stays server-only and is used narrowly.
- Admin MFA is required before production use.
- Demo accounts cannot perform real referral/admin operations.

### Security blocker before admin UI

`POST /api/notifications/emit` currently lets any authenticated participant choose any Make event type and arbitrary data, including `care_referral`.

Before admin work:

- Remove `care_referral` from participant-callable event allowlist.
- Permit referral emission only through `/api/referrals/request` after ownership and consent checks.
- Restrict cron events to `CRON_SECRET` callers.
- Build event payloads from server-owned records.
- Add authorization tests.

## 12. Audit model

Append-only `admin_audit_events`:

```text
id, actor_user_id, actor_role, action,
subject_user_id, entity_type, entity_id,
reason, before_snapshot, after_snapshot,
request_id, created_at
```

Audit:

- Identifiable participant detail view.
- Contact reveal.
- Referral assignment/status/contact/retry/closure.
- Screening correction/void.
- Baseline reset/re-baseline requirement.
- Export generation/download.
- Role grant/revoke.
- Failed authorization attempts at aggregate level.

Do not record passwords, tokens, secrets, full AI chat, full raw notes, or whole webhook payloads.

## 13. Schema build order

1. Restrict generic notification endpoint.
2. Add `admin_memberships` and role helper.
3. Add append-only `admin_audit_events`.
4. Add one-time baseline assessment metadata and partial unique index.
5. Add screening correction requests/supersession metadata.
6. Add `referral_cases` and migrate referral creation before webhook emission.
7. Add indexes for participant, assessment, referral, and notification filters.
8. Add privacy-safe aggregate SQL functions/views.
9. Add provider delivery fields only when callback integration exists.

Every migration needs rollback notes and RLS tests for participant, `research_admin`, `referral_staff`, and unrelated user.

## 14. Implementation phases

### Phase 0 — security and baseline lifecycle

- Close notification emission bypass.
- Enforce one active baseline in database/API/UI.
- Add completed-baseline screen state.
- Add participant mistake request.
- Add authorization and duplicate-baseline tests.

### Phase 1 — admin foundation

- Membership schema/RLS.
- Protected admin layout and API guard.
- Audit helper/table.
- Controlled admin seed procedure.
- Unauthorized/disabled-admin error screens.

### Phase 2 — read-only dashboard

- Aggregate cards.
- Native accessible charts.
- Paginated participant operations list.
- Least-privilege participant detail.
- Date/category/status filters.
- Small-cell suppression.

### Phase 3 — referral operations

- Persist referral cases.
- Queue, assignment, status, retry, closure.
- Minimum referral packet and controlled contact reveal.
- Audit every mutation.

### Phase 4 — corrections

- Participant mistake requests.
- Admin correction/void flow.
- Immutable supersession.
- Re-baseline flow.
- Latest-result queries exclude superseded/void rows.

### Phase 5 — hardening

- Two-user/two-role RLS and IDOR tests.
- Accessibility and responsive QA.
- MFA operational check.
- Ethics/adviser review for retention, minors, fields, exports, and small-cell threshold.

## 15. Explicitly excluded from admin MVP

- Separate password/auth database.
- Full clinician portal or EHR.
- Diagnosis or urgency classification.
- Treatment plans, prescriptions, dosing.
- Appointment booking.
- AI clinical prioritization or patient summaries.
- AI chat browsing.
- Raw menstrual/wellness notes in lists.
- Predictive health analytics.
- Real-time dashboard/websockets.
- Dynamic permission editor.
- Bulk messaging campaigns.
- Multi-organization tenancy.
- Provider marketplace.
- Raw CSV export without protocol approval.
- Editing/deleting historical assessments.
- One-click full patient reset.
- New chart library before native implementation proves insufficient.

## 16. Definition of done

Admin MVP is complete only when:

- Same Supabase Auth plus active membership protects every admin page/API.
- Participants cannot access admin data or mutations.
- Referral staff cannot access research-only data.
- One active baseline is enforced at database and API levels.
- Original assessments remain immutable through correction/void workflows.
- Dashboard uses real aggregates with accessible text equivalents.
- Patient list exposes minimum necessary fields.
- Referral requests persist before notification attempts.
- Sensitive views/mutations create audit events.
- Errors preserve user work and expose no internals.
- Modals are keyboard accessible and state consequences clearly.
- Lint, build, unit tests, RLS tests, authorization tests, and manual role QA pass.

## 17. Decisions required before coding

1. Approve roles: `research_admin`, `referral_staff`.
2. Approve whether full names appear in research-admin list or only participant detail.
3. Approve small-cell suppression threshold; proposal `<5`.
4. Approve follow-up screening interval, or keep follow-up disabled.
5. Approve correction/void authority and required evidence.
6. Approve retention period and minor/guardian access policy.
7. Approve whether exports are excluded entirely from MVP.
8. Confirm admin MFA method and controlled first-admin seeding procedure.
