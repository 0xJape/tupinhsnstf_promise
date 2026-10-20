-- Persist patient-requested referral work before external notification delivery.

create table if not exists public.referral_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  assessment_id uuid not null references public.risk_assessments(id) on delete restrict,
  status text not null default 'new' check (status in ('new', 'contacting', 'completed', 'unable_to_contact', 'declined', 'closed')),
  patient_note text check (patient_note is null or char_length(patient_note) <= 500),
  preferred_call_at timestamptz,
  time_zone text check (time_zone is null or char_length(time_zone) <= 100),
  assigned_to uuid references public.admin_memberships(user_id) on delete set null,
  notification_event_id uuid references public.notification_events(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_contact_at timestamptz,
  closed_at timestamptz
);

create unique index if not exists referral_cases_one_active_per_assessment_idx
  on public.referral_cases(assessment_id)
  where status in ('new', 'contacting');
create index if not exists referral_cases_queue_idx
  on public.referral_cases(status, created_at asc);
create index if not exists referral_cases_user_idx
  on public.referral_cases(user_id, created_at desc);

create trigger referral_cases_set_updated_at
before update on public.referral_cases
for each row execute function public.set_updated_at();

alter table public.referral_cases enable row level security;

-- Preserve referrals submitted before cases existed when payload still links a valid assessment.
insert into public.referral_cases (user_id, assessment_id, status, notification_event_id, created_at)
select event.user_id, assessment.id, 'new', event.id, event.created_at
from public.notification_events event
join public.risk_assessments assessment
  on assessment.id::text = event.payload->'data'->>'assessmentId'
 and assessment.user_id = event.user_id
where event.event_type = 'care_referral'
on conflict do nothing;

create policy "referral cases own select" on public.referral_cases
for select using (user_id = auth.uid());
create policy "referral cases own insert" on public.referral_cases
for insert with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.risk_assessments assessment
    where assessment.id = assessment_id
      and assessment.user_id = auth.uid()
      and assessment.referral_recommended
      and assessment.record_status = 'valid'
  )
);
create policy "admins read referral cases" on public.referral_cases
for select using (public.has_admin_role(array['research_admin', 'referral_staff']));
create policy "admins update referral cases" on public.referral_cases
for update using (public.has_admin_role(array['research_admin', 'referral_staff']))
with check (public.has_admin_role(array['research_admin', 'referral_staff']));

-- Referral staff can read only participant and assessment rows attached to a case.
create policy "referral staff read case profiles" on public.profiles
for select using (
  public.has_admin_role(array['referral_staff'])
  and exists (select 1 from public.referral_cases referral where referral.user_id = profiles.id)
);
create policy "referral staff read case assessments" on public.risk_assessments
for select using (
  public.has_admin_role(array['referral_staff'])
  and exists (select 1 from public.referral_cases referral where referral.assessment_id = risk_assessments.id)
);
create policy "referral staff read case notifications" on public.notification_events
for select using (
  public.has_admin_role(array['referral_staff'])
  and exists (select 1 from public.referral_cases referral where referral.notification_event_id = notification_events.id)
);

comment on table public.referral_cases is 'Patient-opted-in operational follow-up cases; not diagnoses, urgency ratings, or appointments.';
