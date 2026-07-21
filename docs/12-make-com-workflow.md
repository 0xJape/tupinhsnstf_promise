# P.R.O.M.I.S.E Notification System

## Phase 1 — Care Referral Implementation

## Objective

Implement the complete **Care Referral** notification workflow using **Make.com**, **Gmail**, and **UniSMS**.

When a user **opts in** on a Moderate/High screening result, the app notifies the **care desk** (not the patient) by Email and/or SMS.

App code already exists. This doc is **Make + env setup only**.

---

# Overall Architecture

```text
User opts in (Seek care) on screening result
            │
            ▼
P.R.O.M.I.S.E Application
(Next.js + Supabase)
  • loads assessment + profile
  • CARE_DESK_EMAIL / CARE_DESK_PHONE → delivery targets
  • patient details in data.patient
  • audit row: notification_events
            │
            │ POST JSON
            ▼
Make Custom Webhook
            │
            ▼
Event Router  (eventType)
            │
            ▼
Care Referral
            │
            ▼
Channel Router  (channels[])
      ┌─────────────┐
      ▼             ▼
 Gmail        HTTP Request
                  │
                  ▼
             UniSMS API
```

**Data source:** App reads Supabase. Make never queries Supabase — only the webhook body.

---

# Step 1 — Create the Make Scenario

Create a new scenario named:

```
PROMISE Care Referral
```

Module layout:

```
Webhook
    │
    ▼
Event Router
    │
    ▼
Care Referral   (eventType = care_referral)
    │
    ▼
Channel Router
   ├── Gmail          (channels contains email)
   └── HTTP → UniSMS  (channels contains sms)
```

---

# Step 2 — Create the Custom Webhook

1. **+** → **Webhooks** → **Custom webhook**
2. Name: `PROMISE Care Referral`
3. Save → copy the URL **once** (one line only):

```
https://hook.eu1.make.com/xxxxxxxxxxxxxxxx
```

4. Put in `.env.local` (full block in Step 3).
5. Click **OK** so the webhook sits on the canvas.

**Do not** paste the URL twice. **Do not** paste markdown fences into PowerShell.

---

# Step 3 — Environment variables

`.env.local`:

```env
MAKE_WEBHOOK_URL=https://hook.eu1.make.com/xxxxxxxxxxxxxxxx
MAKE_WEBHOOK_SECRET=long-random-you-invent
CRON_SECRET=different-long-random

# Care desk = who receives care_referral (required for this phase)
CARE_DESK_EMAIL=caredesk@your.org
CARE_DESK_PHONE=+639171234567

NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (emit uses service role for audit + profile)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

| Variable | Who invents it | Role |
|----------|----------------|------|
| `MAKE_WEBHOOK_URL` | Make UI | Hook endpoint |
| `MAKE_WEBHOOK_SECRET` | **You** (not shown in Make) | App sends header `x-make-secret`. Free Make often cannot verify it — still set for later. |
| `CARE_DESK_EMAIL` | You | Top-level payload `email` for Gmail **To** |
| `CARE_DESK_PHONE` | You | Top-level payload `mobile` for UniSMS (E.164) |
| `CRON_SECRET` | You | Later phases / manual emit API |

If both care desk contacts empty → app returns `care_desk_not_configured` (503). No Make call.

**Restart** after edit: `Ctrl+C` → `npm run dev`.

Generate secrets (PowerShell):

```powershell
-join ((48..57 + 97..122) | Get-Random -Count 40 | ForEach-Object { [char]$_ })
```

---

# Step 4 — Notification payload (what the app actually sends)

Top-level `email` / `mobile` = **care desk** (from env).  
Patient contact lives under **`data.patient`** — use in the body only, never as Gmail **To**.

```json
{
  "eventType": "care_referral",
  "userId": "patient-uuid",
  "email": "caredesk@your.org",
  "mobile": "+639171234567",
  "channels": ["email", "sms"],
  "templateKey": "care_referral_v1",
  "data": {
    "firstName": "Jane",
    "appUrl": "http://localhost:3000",
    "assessmentId": "uuid",
    "category": "High",
    "totalScore": 12,
    "bmi": 28.1,
    "ruleVersion": "pcos-screen-v1",
    "referralRecommended": true,
    "factors": ["Irregular menstrual cycles"],
    "assessedAt": "2026-07-17T12:00:00.000Z",
    "userNote": "Please contact after 3 PM.",
    "patient": {
      "userId": "patient-uuid",
      "fullName": "Jane Doe",
      "email": "patient@example.com",
      "mobile": "+63917xxxxxxx",
      "dateOfBirth": "2000-01-01"
    },
    "careDesk": {
      "email": "caredesk@your.org",
      "mobile": "+639171234567"
    }
  },
  "timestamp": "2026-07-17T12:00:00.000Z",
  "eventId": "notification-events-uuid"
}
```

Headers from app:

| Header | Value |
|--------|--------|
| `Content-Type` | `application/json` |
| `x-make-secret` | `MAKE_WEBHOOK_SECRET` (if set) |

`channels` only includes what desk env supports (email if `CARE_DESK_EMAIL` set, sms if `CARE_DESK_PHONE` set).

---

# Step 5 — Teach Make the data structure

1. Open webhook → **Run once** / **Redetermine data structure** → Listening…
2. PowerShell (replace hook URL + desk contacts; **no** trailing `` ``` ``):

```powershell
$uri = "https://hook.eu1.make.com/YOUR_HOOK_ID"
$body = @{
  eventType   = "care_referral"
  userId      = "00000000-0000-0000-0000-000000000001"
  email       = "caredesk@your.org"
  mobile      = "+639171234567"
  channels    = @("email", "sms")
  templateKey = "care_referral_v1"
  data        = @{
    firstName            = "Jane"
    appUrl               = "http://localhost:3000"
    assessmentId         = "00000000-0000-0000-0000-000000000010"
    category             = "High"
    totalScore           = 12
    bmi                  = 28.1
    ruleVersion          = "pcos-screen-v1"
    referralRecommended  = $true
    factors              = @("Irregular menstrual cycles")
    assessedAt           = (Get-Date).ToUniversalTime().ToString("o")
    userNote             = "Please contact after 3 PM."
    patient              = @{
      userId      = "00000000-0000-0000-0000-000000000001"
      fullName    = "Jane Doe"
      email       = "patient@example.com"
      mobile      = "+63917xxxxxxx"
      dateOfBirth = "2000-01-01"
    }
    careDesk = @{
      email  = "caredesk@your.org"
      mobile = "+639171234567"
    }
  }
  timestamp = (Get-Date).ToUniversalTime().ToString("o")
  eventId   = "00000000-0000-0000-0000-000000000099"
} | ConvertTo-Json -Depth 6

Invoke-RestMethod -Method Post -Uri $uri -ContentType "application/json" -Body $body
```

3. Make shows structure learned → **OK**.

After learning, Make should expose:

**Top-level:** `eventType`, `userId`, `email`, `mobile`, `channels`, `templateKey`, `timestamp`, `eventId`, `data`

**Inside `data`:** `firstName`, `appUrl`, `assessmentId`, `category`, `totalScore`, `bmi`, `factors`, `userNote`, `assessedAt`, `patient`, `careDesk`

**Inside `data.patient`:** `userId`, `fullName`, `email`, `mobile`, `dateOfBirth`

> Wrong sample keys like flat `data.patientName` will **not** match production. Use the sample above.

**404 Not found** → wrong or doubled hook URL. Copy again from Make.

---

# Step 6 — Event Router

After webhook → **+** → **Flow control** → **Router**.

### Route: Care Referral

| Left | Operator | Right |
|------|----------|--------|
| `eventType` | Equals | `care_referral` |

Future Phase 2+ routes (same Event Router, new filters):

- `elevated_risk_followup`
- `period_reminder`
- `missed_tracking_reminder`
- `weekly_education`

---

# Step 7 — Channel Router

Inside the Care Referral branch → another **Router**.

```
Care Referral
      │
      ▼
Channel Router
   ├── Route A — Email
   └── Route B — SMS
```

### Route A — Email

| Left | Operator | Right |
|------|----------|--------|
| `channels` | Contains | `email` |

→ Gmail

Also filter: `email` **Exists** and not empty.

### Route B — SMS

| Left | Operator | Right |
|------|----------|--------|
| `channels` | Contains | `sms` |

→ HTTP Request (UniSMS)

Also filter: `mobile` **Exists** and not empty.

---

# Step 8 — Configure Gmail

**Gmail → Send an Email** (or Microsoft 365 / SMTP).

| Field | Map |
|-------|-----|
| **To** | webhook top-level `email` (care desk). **Never** patient email |
| **Subject** | see template (module number required) |
| **Body** | dynamic template below |

**Make mapping rule:** every path needs **webhook module number** first (this scenario: **`7`** — check bubble on webhook module).

- Correct: `{{7.data.patient.fullName}}`
- Wrong: `{{data.patient.fullName}}` / `{{data:patient:fullName}}` (no module id → blank)

Best: click field chips from webhook panel (Make inserts number for you).  
If paste fails, type `{{` then pick fields. Paths below use module **7**.

**To:** `{{7.email}}`

**Subject**

```
P.R.O.M.I.S.E Care Referral — {{7.data.patient.fullName}} ({{7.data.category}})
```

**Gmail content type:** HTML (not plain text).

**Body (HTML) — care referral / desk** — paste into Gmail Content; keep module **7** paths:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Care Referral</title>
</head>
<body style="margin:0;padding:0;background:#f4f1fa;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#332f3a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f1fa;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(160,150,180,0.22);box-shadow:0 8px 28px rgba(51,47,58,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed 0%,#db2777 100%);padding:28px 28px 22px;color:#ffffff;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.9;font-weight:600;">P.R.O.M.I.S.E</div>
                    <div style="font-size:22px;font-weight:700;margin-top:8px;line-height:1.25;">Care referral request</div>
                    <div style="font-size:14px;margin-top:8px;opacity:0.95;">User opted in · for care desk review</div>
                  </td>
                  <td align="right" valign="top" style="padding-left:12px;">
                    <div style="display:inline-block;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.35);border-radius:999px;padding:6px 12px;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">Priority</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Intro + risk pill -->
          <tr>
            <td style="padding:24px 28px 8px;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:16px;">
                <tr>
                  <td style="background:#faf5ff;color:#7c3aed;border:1px solid rgba(124,58,237,0.2);border-radius:999px;padding:8px 16px;font-size:14px;font-weight:700;">
                    {{7.data.category}} · score {{7.data.totalScore}}
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:15px;line-height:1.55;color:#635f69;">
                A participant asked the care team to review their screening result. Contact details and snapshot below.
              </p>
              <p style="margin:0 0 18px;font-size:13px;line-height:1.5;color:#635f69;">
                This is <strong style="color:#332f3a;">not a medical diagnosis</strong> and does not replace clinical judgment.
              </p>
            </td>
          </tr>
          <!-- Patient card -->
          <tr>
            <td style="padding:0 28px 8px;">
              <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#635f69;margin-bottom:10px;">Patient</div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#faf8fc;border-radius:12px;border:1px solid rgba(160,150,180,0.18);">
                <tr>
                  <td style="padding:18px 18px;font-size:14px;line-height:1.65;">
                    <div style="font-size:18px;font-weight:700;color:#332f3a;margin-bottom:10px;">{{7.data.patient.fullName}}</div>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;">
                      <tr>
                        <td style="padding:4px 0;width:72px;color:#635f69;vertical-align:top;">Email</td>
                        <td style="padding:4px 0;color:#332f3a;font-weight:600;">{{7.data.patient.email}}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#635f69;vertical-align:top;">Mobile</td>
                        <td style="padding:4px 0;color:#332f3a;font-weight:600;">{{7.data.patient.mobile}}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#635f69;vertical-align:top;">DOB</td>
                        <td style="padding:4px 0;color:#332f3a;">{{7.data.patient.dateOfBirth}}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#635f69;vertical-align:top;">User ID</td>
                        <td style="padding:4px 0;font-size:12px;color:#635f69;word-break:break-all;">{{7.data.patient.userId}}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Screening snapshot -->
          <tr>
            <td style="padding:18px 28px 8px;">
              <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#635f69;margin-bottom:10px;">Screening snapshot</div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="50%" style="padding-right:6px;vertical-align:top;">
                    <div style="padding:14px 14px;background:#faf8fc;border-radius:12px;border:1px solid rgba(160,150,180,0.18);">
                      <div style="color:#635f69;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">BMI</div>
                      <div style="font-weight:700;font-size:20px;margin-top:6px;color:#332f3a;">{{7.data.bmi}}</div>
                    </div>
                  </td>
                  <td width="50%" style="padding-left:6px;vertical-align:top;">
                    <div style="padding:14px 14px;background:#faf8fc;border-radius:12px;border:1px solid rgba(160,150,180,0.18);">
                      <div style="color:#635f69;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">Assessment ID</div>
                      <div style="font-weight:600;font-size:11px;margin-top:8px;color:#332f3a;word-break:break-all;line-height:1.4;">{{7.data.assessmentId}}</div>
                    </div>
                  </td>
                </tr>
              </table>
              <div style="margin-top:12px;padding:14px 16px;background:#fff7ed;border-radius:12px;border:1px solid rgba(245,158,11,0.25);font-size:14px;line-height:1.5;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#b45309;margin-bottom:6px;">Contributing factors</div>
                <div style="color:#332f3a;">{{7.data.factors}}</div>
              </div>
              <div style="margin-top:12px;padding:14px 16px;background:#f0f9ff;border-radius:12px;border:1px solid rgba(14,165,233,0.22);font-size:14px;line-height:1.5;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#0369a1;margin-bottom:6px;">User note</div>
                <div style="color:#332f3a;">{{7.data.userNote}}</div>
              </div>
              <p style="margin:14px 0 0;font-size:12px;color:#635f69;">Assessed at · {{7.data.assessedAt}}</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 28px 28px;">
              <div style="padding:14px 16px;background:#fef2f2;border-radius:12px;border:1px solid rgba(225,29,72,0.15);font-size:12px;line-height:1.5;color:#9f1239;">
                Automated educational screening summary only. Not a diagnosis. Not a substitute for clinical judgment. Follow your care desk protocol for outreach.
              </div>
              <p style="margin:18px 0 0;font-size:12px;color:#635f69;text-align:center;">— P.R.O.M.I.S.E care desk notification —</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

# Step 9 — Configure UniSMS

No native UniSMS module required. Use:

```
HTTP → Make a Request
```

| Field | Value |
|-------|--------|
| Method | `POST` |
| URL | `https://unismsapi.com/api/sms` |
| Body type | Raw / JSON |

### Authentication

| Setting | Value |
|---------|--------|
| Type | Basic Auth |
| Username | `YOUR_UNISMS_API_SECRET_KEY` |
| Password | *(leave empty)* |

UniSMS uses the API secret as Basic Auth **username**; password blank.

### Headers

```
Content-Type: application/json
```

### Request body

```json
{
  "recipient": "{{7.mobile}}",
  "content": "PROMISE care referral: {{7.data.patient.fullName}} — {{7.data.category}} (score {{7.data.totalScore}}). Check desk email for full details. Not a diagnosis.",
  "sender_id": "YOUR_TEST_SENDER_ID"
}
```

Map `recipient` from top-level webhook **`mobile`** (care desk phone). Same rule: `{{7....}}` — webhook module **7**.

**Important:**

| Correct | Wrong |
|---------|--------|
| field name `content` | `message` |
| `sender_id` required | omit sender |
| desk `mobile` as recipient | patient mobile as To (unless desk = same number by design) |

Store UniSMS secret + sender id in Make connection / module only — not in the public repo.

---

# Step 10 — Turn scenario ON and test Make

1. Scenario toggle **ON** → Save  
2. **Run once** (optional while debugging)  
3. Send PowerShell sample from Step 5  

Expected path:

```
Webhook
  → Event Router → Care Referral
    → Channel Router
         ├─ Gmail     (if channels has email)
         └─ UniSMS    (if channels has sms)
```

Verify:

- [ ] Webhook receives payload  
- [ ] Event Router hits Care Referral  
- [ ] Email route when `channels` contains `email`  
- [ ] SMS route when `channels` contains `sms`  
- [ ] Desk inbox receives mail  
- [ ] Desk phone receives SMS (if configured)  

---

# Step 11 — Test from the PROMISE app

1. `.env.local` complete + dev server restarted  
2. Scenario **ON**  
3. Log in as a real user with profile name/email  
4. Complete screening → **Moderate** or **High**  
5. On result page: check consent → optional note → **Send referral to care team**  
6. Check:  
   - Make **History** (green)  
   - Care desk email / SMS  
   - Supabase `notification_events` → `event_type = care_referral`, `status = sent`  

App path:

| Piece | Role |
|-------|------|
| UI | `SeekCareReferral` on result (Moderate/High only) |
| API | `POST /api/referrals/request` body `{ assessmentId, consentShare: true, note? }` |
| Emit | `emitMakeEvent({ eventType: "care_referral", … })` |

No consent → no webhook. Same assessment within ~72h → `deduped` (no second spam).

### Manual emit (optional, needs real user UUID)

```powershell
$uri = "http://localhost:3000/api/notifications/emit"
$headers = @{
  Authorization  = "Bearer YOUR_CRON_SECRET"
  "Content-Type" = "application/json"
}
$body = @{
  eventType = "care_referral"
  userId    = "REAL-USER-UUID"
  data      = @{
    assessmentId = "REAL-ASSESSMENT-UUID"
    category     = "High"
    totalScore   = 12
    factors      = @("test")
    userNote     = "manual test"
  }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body
```

Note: care desk still comes from env; patient still from that user’s profile.

---

# App skip / fail reasons

| reason | Meaning |
|--------|---------|
| `care_desk_not_configured` | Set `CARE_DESK_EMAIL` and/or `CARE_DESK_PHONE` |
| `no_webhook` | `MAKE_WEBHOOK_URL` empty; restart after env |
| `deduped` | Same care_referral for assessment recently |
| `profile_missing` | No profile row for user |
| `pref_off` | N/A for care_referral (always allowed after consent) |

---

# Troubleshooting

| Symptom | Fix |
|---------|-----|
| PowerShell 404 | One correct hook URL; no double paste; no markdown fences |
| Make never runs from app | Scenario OFF? Wrong URL? Dev not restarted? |
| **Webhook green, Gmail never runs** | **Router filter fail** — see “Router filters that work” below |
| Gmail To wrong person | Map top-level `email` only (desk), not `data.patient.email` |
| Empty chips in Make | Re-run Step 5 sample with full `data.patient` object |
| SMS route skipped | `CARE_DESK_PHONE` empty → no `sms` in `channels` |
| UniSMS error | Basic auth username = secret; password empty; use `content` + `sender_id` |
| 503 from app | Care desk env missing |
| 502 from app | Make non-2xx or network; open Make History |

### Router filters that work

History: webhook **green**, next module **grey / not executed** → filter blocked the route.

**Event Router** (after webhook module **7**). Two routes — set filter on the **wrench** between modules:

| Route label | Left (map chip from **7**) | Operator | Right (type exactly, **no quotes**) |
|-------------|----------------------------|----------|-------------------------------------|
| Care referral | `eventType` | **Equal to** | `care_referral` |
| Elevated follow-up | `eventType` | **Equal to** | `elevated_risk_followup` |

Wrong:
- Typing `eventType` as plain text on the left (must be **mapped field** from webhook)
- Right side `"care_referral"` **with quotes**
- Typo / spaces: `care referral`, `Care_Referral`
- Filtering `templateKey` instead of `eventType`
- Only one route + no fallback → other event dies silently

**Channel Router** (inside each event branch):

| Route | Left | Operator | Right |
|-------|------|----------|--------|
| Email | `channels` | **Contains** | `email` |
| SMS | `channels` | **Contains** | `sms` |

Optional AND: `email` **Exist** / `mobile` **Exist**.

If `Contains` on array fails in your Make version: use **Text operators → Contains** on `channels`, or temporarily **delete channel filters** and only keep Event Router until mail works.

**Quick prove filters:**
1. Open History → click run → expand webhook output → confirm `eventType` string exact.
2. Temporarily **remove all filters** on one route → Run once → if Gmail sends, filters were wrong.
3. Re-add Event filter only (one condition) → test → then Channel filter.

---

# Security & compliance (short)

1. Never commit `.env.local`, hook URL, or UniSMS secret to a public repo.  
2. Hook URL = password — rotate in Make if leaked.  
3. Care packet only after **user opt-in** in app.  
4. Copy stays **non-diagnostic**.  
5. Do not dump full medical history into Make — screening summary + profile contact only.  

---

# Current scope

| Phase | eventType | Recipient | Status |
|-------|-----------|-----------|--------|
| 1 | `care_referral` | Care desk | Steps 1–11 above |
| 2 | `elevated_risk_followup` | **User** | Steps E1–E8 below |
| Later | period / missed / weekly | User | Same Event Router pattern |

---

# Phase 2 — Elevated Risk Follow-up

## Objective

When screening is **Moderate/High** (`referralRecommended`), app **auto-emits** `elevated_risk_followup` to the **user** (not care desk). Soft education + consult nudge. **Not a diagnosis.**

No extra opt-in button — gated by:

- `notification_preferences.risk_followups` (default true if no row)
- `email_enabled` / `sms_enabled` + profile email/mobile
- 48h dedupe per user for this event type

## Architecture (same webhook)

```text
Screening saved (Moderate/High)
        │
        ▼
emitMakeEvent(elevated_risk_followup)
  email/mobile = patient profile
  channels = user prefs
        │
        ▼
Webhook (module 7)
        │
        ▼
Event Router
   ├── care_referral           → desk Gmail / UniSMS
   └── elevated_risk_followup  → user Gmail / UniSMS
```

Reuse **same** Custom Webhook URL. Only add Event Router branch + Channel Router + modules.

## E1 — Payload (what app sends)

Top-level `email` / `mobile` = **patient**. No `data.patient` / `data.careDesk` objects.

```json
{
  "eventType": "elevated_risk_followup",
  "userId": "patient-uuid",
  "email": "patient@example.com",
  "mobile": "+63917xxxxxxx",
  "channels": ["email"],
  "templateKey": "elevated_risk_v1",
  "data": {
    "firstName": "Jane",
    "appUrl": "http://localhost:3000",
    "assessmentId": "uuid",
    "category": "High",
    "totalScore": 12,
    "factors": ["Irregular menstrual cycles"]
  },
  "timestamp": "2026-07-17T12:00:00.000Z",
  "eventId": "notification-events-uuid"
}
```

| Field | Source |
|-------|--------|
| `email` / `mobile` | Profile (user) |
| `channels` | Prefs + contact present |
| `data.firstName` | First word of `full_name` |
| `data.category` / `totalScore` / `factors` / `assessmentId` | Screening API |

## E2 — Teach Make (PowerShell)

Webhook **Run once** / redetermine if needed. Then:

```powershell
$uri = "https://hook.eu1.make.com/YOUR_HOOK_ID"
$body = @{
  eventType   = "elevated_risk_followup"
  userId      = "00000000-0000-0000-0000-000000000001"
  email       = "patient@example.com"
  mobile      = "+639171234567"
  channels    = @("email", "sms")
  templateKey = "elevated_risk_v1"
  data        = @{
    firstName    = "Jane"
    appUrl       = "http://localhost:3000"
    assessmentId = "00000000-0000-0000-0000-000000000010"
    category     = "High"
    totalScore   = 12
    factors      = @("Irregular menstrual cycles", "Elevated BMI")
  }
  timestamp = (Get-Date).ToUniversalTime().ToString("o")
  eventId   = "00000000-0000-0000-0000-000000000088"
} | ConvertTo-Json -Depth 6

Invoke-RestMethod -Method Post -Uri $uri -ContentType "application/json" -Body $body
```

## E3 — Event Router (new route)

Same Event Router as care referral. **Add route:**

| Left | Operator | Right |
|------|----------|--------|
| `eventType` | Equals | `elevated_risk_followup` |

Order: both routes independent filters. Fallback empty OK.

## E4 — Channel Router (user)

Inside elevated branch → **Router** (copy care-referral pattern):

| Route | Filter | Next |
|-------|--------|------|
| Email | `channels` Contains `email` + `email` Exists | Gmail |
| SMS | `channels` Contains `sms` + `mobile` Exists | HTTP UniSMS |

## E5 — Gmail (user)

**Gmail → Send an Email**

| Field | Map |
|-------|-----|
| **To** | `{{7.email}}` — **user**, never care desk |
| **Subject** | below |
| **Body** | below |

Webhook module = **7** (yours). Change if bubble differs.

**Subject**

```
P.R.O.M.I.S.E — Your screening follow-up ({{7.data.category}})
```

**Gmail content type:** HTML.

**Body (HTML)**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Screening follow-up</title>
</head>
<body style="margin:0;padding:0;background:#f4f1fa;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#332f3a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f1fa;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid rgba(160,150,180,0.22);box-shadow:0 8px 28px rgba(51,47,58,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed 0%,#0ea5e9 100%);padding:28px 28px 22px;color:#ffffff;">
              <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.9;font-weight:600;">P.R.O.M.I.S.E</div>
              <div style="font-size:22px;font-weight:700;margin-top:8px;line-height:1.25;">Hi {{7.data.firstName}}</div>
              <div style="font-size:14px;margin-top:8px;opacity:0.95;">Your screening follow-up</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#635f69;">
                Thanks for completing the screening. Below is a gentle summary of your result. This is <strong style="color:#332f3a;">not a medical diagnosis</strong> and does not replace professional care.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:18px;">
                <tr>
                  <td style="background:#faf5ff;color:#7c3aed;border:1px solid rgba(124,58,237,0.2);border-radius:999px;padding:8px 16px;font-size:14px;font-weight:700;">
                    {{7.data.category}} · score {{7.data.totalScore}}
                  </td>
                </tr>
              </table>
              <div style="padding:14px 16px;background:#fff7ed;border-radius:12px;border:1px solid rgba(245,158,11,0.25);font-size:14px;line-height:1.5;margin-bottom:18px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#b45309;margin-bottom:6px;">Factors noted</div>
                <div style="color:#332f3a;">{{7.data.factors}}</div>
              </div>
              <p style="margin:0 0 18px;font-size:15px;line-height:1.55;color:#332f3a;">
                If you have concerns about menstrual health or PCOS-related symptoms, consider talking with a qualified healthcare professional.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 8px;">
                <tr>
                  <td style="border-radius:999px;background:#7c3aed;">
                    <a href="{{7.data.appUrl}}/screen" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
                      Open my result in the app
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#635f69;text-align:center;">
                Optional: use the in-app assistant for plain-language education (still not a diagnosis).
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;">
              <div style="padding:14px 16px;background:#fef2f2;border-radius:12px;border:1px solid rgba(225,29,72,0.15);font-size:12px;line-height:1.5;color:#9f1239;">
                Educational screening summary only. Not a diagnosis. Not emergency care. Seek urgent help if you feel unsafe or severely unwell.
              </div>
              <p style="margin:18px 0 0;font-size:12px;color:#635f69;text-align:center;">— P.R.O.M.I.S.E —</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## E6 — UniSMS (user)

Same HTTP module settings as care referral (URL, Basic auth, `content` + `sender_id`).

```json
{
  "recipient": "{{7.mobile}}",
  "content": "Hi {{7.data.firstName}}, PROMISE follow-up: your screening was {{7.data.category}}. Not a diagnosis. Consider consulting a clinician if concerned. Open app: {{7.data.appUrl}}/screen",
  "sender_id": "YOUR_TEST_SENDER_ID"
}
```

Keep SMS short. Full detail stays in email.

## E7 — Test Make

1. Scenario **ON**  
2. PowerShell sample E2  
3. History: Event Router → elevated branch → Gmail/SMS  
4. Inbox = **patient@example.com** (sample), not desk  

## E8 — Test from app

1. User: profile email set; prefs: **risk follow-ups** on; email and/or SMS on  
2. Complete screening → **Moderate** or **High**  
3. No extra click — emit runs after save  
4. Check Make History + `notification_events` (`event_type = elevated_risk_followup`, `status = sent`)  
5. User inbox/SMS  

### Manual emit

```powershell
$uri = "http://localhost:3000/api/notifications/emit"
$headers = @{
  Authorization  = "Bearer YOUR_CRON_SECRET"
  "Content-Type" = "application/json"
}
$body = @{
  eventType = "elevated_risk_followup"
  userId    = "REAL-USER-UUID"
  data      = @{
    assessmentId = "REAL-ASSESSMENT-UUID"
    category     = "High"
    totalScore   = 12
    factors      = @("test factor")
  }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body
```

## Elevated vs care referral (do not mix)

| | `elevated_risk_followup` | `care_referral` |
|--|--------------------------|-----------------|
| Trigger | Auto on Moderate/High save | User opt-in Seek care |
| To | User profile | `CARE_DESK_*` |
| Pref | `risk_followups` + channel prefs | Always after consent |
| Dedupe | 48h per user | 72h per assessment |
| Body | Soft user nudge | Desk packet + `data.patient` |

## Skip / fail (elevated)

| reason | Meaning |
|--------|---------|
| `pref_off` | `risk_followups` false |
| `no_channel` | No email/SMS enabled or missing contact |
| `deduped` | Same event within 48h |
| `profile_missing` | No profile |
| `no_webhook` | `MAKE_WEBHOOK_URL` empty |

## Done when (elevated)

- [ ] Event Router has `elevated_risk_followup` route  
- [ ] Gmail **To** = `{{7.email}}` (user)  
- [ ] PowerShell E2 → user inbox  
- [ ] App Moderate/High → History green + audit `sent`  
- [ ] Copy non-diagnostic  

---

# Code map

| File | Role |
|------|------|
| `src/lib/make/emit.ts` | Build payload, care desk vs user routing, POST webhook, audit |
| `src/lib/make/types.ts` | Event types + template keys |
| `src/app/api/referrals/request/route.ts` | Care referral opt-in API |
| `src/app/api/screening/route.ts` | Auto `elevated_risk_followup` on Moderate/High |
| `src/components/screening/SeekCareReferral.tsx` | Care referral UI |
| `src/app/(app)/screen/result/[id]/page.tsx` | Mounts Seek care block |

---

# Done when (care referral)

- [ ] Scenario **PROMISE Care Referral** is **ON**  
- [ ] PowerShell sample → desk email (and SMS if configured)  
- [ ] `.env.local` has webhook + `CARE_DESK_*` + secrets  
- [ ] App: consent → Send referral → Make History green + `notification_events.status = sent`  
- [ ] Gmail **To** is care desk, body includes `data.patient.*`  
- [ ] Elevated route also green (Phase 2 checklist above)  
