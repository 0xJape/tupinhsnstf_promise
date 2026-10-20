# Promi modal trigger map

This file is source of truth for authenticated-app Promi guidance. Cycle estimates are educational only. They do not confirm ovulation, fertility, pregnancy, PCOS, or diagnosis.

## Where trigger appears

`DailyPromiGuide` is mounted by `src/app/(app)/layout.tsx`, so it can appear on every authenticated route. A notification banner sits below top bar. Banner text names guidance currently available. Closing modal does not remove banner; user can reopen it.

## Priority order

Only one automatic/global Promi modal wins at a time:

1. Guided destination handoff (`?guided=1`)
2. Expected-period or delayed-period alert
3. No-history date prompt
4. On-track phase suggestions
5. Completed daily check-in confirmation
6. Daily check-in suggestion

Higher priority prevents lower-priority modal from rendering at same time.

## Trigger matrix

| State | Banner text | Modal | Opens automatically? | Main action |
|---|---|---|---|---|
| No period logs | Add your latest period date | Latest-period date picker | No | Prefill `/cycle/new?guided=1&date=YYYY-MM-DD` |
| Expected period window | Your estimated period window is here | Due-period comfort and logging prompt | Yes, once per expected date per browser tab | Open period log |
| Expected date passed | No period start logged yet | Delayed-period comfort and logging prompt | Yes, once per expected date per browser tab | Open period log |
| 2+ logs, on track, known phase | `{phase} suggestions` | Phase guide with food, noticing, and gentle-reset prompts | No | Ask Promi or close |
| Daily check-in exists today | Today’s check-in is complete | Saved-entry confirmation | No | View entry |
| Period history exists, no check-in today | Cycle day / small check-in | Daily check-in suggestion | No | Open check-in |
| Arrive at `/track?guided=1` | Banner hidden | Check-in reassurance or already-complete confirmation | Yes | Start/view form |
| Arrive at `/cycle/new?guided=1` | Banner hidden | Period-log reassurance | Yes | Start form |

## Phase suggestion requirements

Phase suggestions appear only when all conditions are true:

- At least two period starts are logged.
- Estimated phase is known.
- Cycle status is `on_track`.
- URL is not a guided destination.

When period is due or delayed, period alert replaces phase suggestions. User should resolve by logging bleeding only if it began. If it has not begun, user can dismiss alert; banner remains available.

## Automatic-alert memory

Expected-period alert uses session key:

`promise:period-alert:{nextExpectedStart}`

Meaning:

- Auto-opens once for that expected date in current browser tab.
- Refresh/navigation does not repeatedly interrupt user.
- New tab or browser session may show alert again.
- Banner remains clickable after dismissal.

## Daily check-in safeguards

- Form cannot submit before notes/final step.
- Server rejects second entry for same user and date.
- Existing daily entry replaces form with completion card.
- Guided check-in modal says entry is already complete when applicable.

## Unlock guidance and voice

- Non-phase Promi modals show **What unlocks next** with exact required action.
- No-history state explains first start unlocks cycle picture and second start unlocks phase estimates.
- Completed check-in explains next check-in becomes available tomorrow.
- Due/late state never asks user to invent bleeding; new cycle begins only after real start is logged.
- Phase guide offers **Listen** for static suggestions.
- AI-generated food, noticing, and gentle-reset answers offer **Listen to Promi**.
- Voice uses browser speech synthesis through `src/lib/ai/tts.ts`; unsupported browsers hide voice controls.

## Related files

- `src/components/layout/DailyPromiGuide.tsx` — global priority and modal routing
- `src/components/cycle/PhaseGuide.tsx` — phase suggestions and bounded AI prompts
- `src/components/cycle/LastPeriodPrompt.tsx` — first-history date prompt
- `src/components/cycle/PatternSummary.tsx` — user-triggered AI pattern reflection; not automatic
- `src/app/(app)/layout.tsx` — current cycle/check-in data loader
- `src/lib/cycle/insights.ts` — cycle status and phase calculation
- `src/app/(app)/track/page.tsx` — completed-check-in display

## Manual test states

1. Zero period logs → banner opens date picker.
2. One period log → banner opens daily check-in guidance.
3. Two valid period intervals, on track → banner opens phase suggestions.
4. Today equals expected date → due-period modal auto-opens once.
5. Today is after expected date → delayed-period modal auto-opens once.
6. Daily entry exists today → banner/modal says complete; form is hidden.
7. Navigate with `?guided=1` → destination reassurance auto-opens.