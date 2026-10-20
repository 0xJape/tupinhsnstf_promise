-- One immutable participant baseline. Corrections create audit-safe requests; they never edit snapshots.

alter table public.risk_assessments
  add column if not exists assessment_type text not null default 'baseline'
    check (assessment_type in ('baseline', 'follow_up')),
  add column if not exists record_status text not null default 'valid'
    check (record_status in ('valid', 'superseded', 'void')),
  add column if not exists supersedes_assessment_id uuid
    references public.risk_assessments(id) on delete restrict,
  add column if not exists correction_reason text,
  add column if not exists source text not null default 'participant'
    check (source in ('participant', 'admin_correction'));

-- Preserve historical snapshots. First completed assessment is baseline; later rows become follow-ups.
with ordered as (
  select id, row_number() over (partition by user_id order by created_at asc, id asc) as position
  from public.risk_assessments
)
update public.risk_assessments assessment
set assessment_type = case when ordered.position = 1 then 'baseline' else 'follow_up' end
from ordered
where assessment.id = ordered.id;

create unique index if not exists risk_assessments_one_active_baseline_per_user_idx
  on public.risk_assessments(user_id)
  where assessment_type = 'baseline' and record_status = 'valid';

create index if not exists risk_assessments_user_baseline_idx
  on public.risk_assessments(user_id, assessment_type, record_status, created_at desc);

create table if not exists public.assessment_correction_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  assessment_id uuid not null references public.risk_assessments(id) on delete restrict,
  reason text not null check (char_length(trim(reason)) between 10 and 500),
  status text not null default 'open' check (status in ('open', 'resolved', 'declined')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create unique index if not exists assessment_correction_requests_one_open_per_assessment_idx
  on public.assessment_correction_requests(user_id, assessment_id)
  where status = 'open';

alter table public.assessment_correction_requests enable row level security;

create policy "assessment correction requests own select" on public.assessment_correction_requests
for select using (user_id = auth.uid());

create policy "assessment correction requests own insert" on public.assessment_correction_requests
for insert with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.risk_assessments assessment
    where assessment.id = assessment_id
      and assessment.user_id = auth.uid()
      and assessment.assessment_type = 'baseline'
      and assessment.record_status = 'valid'
  )
);

comment on column public.risk_assessments.assessment_type is 'Baseline is first immutable screening; follow_up is future protocol-controlled screening.';
comment on table public.assessment_correction_requests is 'Participant requests for review of an immutable baseline assessment.';
