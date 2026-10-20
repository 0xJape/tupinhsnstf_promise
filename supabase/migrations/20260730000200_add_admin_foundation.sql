-- Narrow admin foundation: database-backed roles, least-privilege reads, append-only audit.

create table if not exists public.admin_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('research_admin', 'referral_staff')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

alter table public.admin_memberships enable row level security;

create or replace function public.has_admin_role(required_roles text[] default array['research_admin', 'referral_staff'])
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_memberships membership
    where membership.user_id = auth.uid()
      and membership.active
      and membership.role = any(required_roles)
  );
$$;

revoke all on function public.has_admin_role(text[]) from public;
grant execute on function public.has_admin_role(text[]) to authenticated;

create policy "admin memberships own select" on public.admin_memberships
for select using (user_id = auth.uid());

create table if not exists public.admin_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  actor_role text not null check (actor_role in ('research_admin', 'referral_staff')),
  action text not null,
  subject_user_id uuid references public.profiles(id) on delete set null,
  entity_type text,
  entity_id uuid,
  reason text,
  before_snapshot jsonb,
  after_snapshot jsonb,
  request_id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.admin_audit_events enable row level security;

create policy "research admins read audit" on public.admin_audit_events
for select using (public.has_admin_role(array['research_admin']));

create or replace function public.log_admin_event(
  action_name text,
  subject_id uuid default null,
  target_type text default null,
  target_id uuid default null,
  action_reason text default null,
  before_data jsonb default null,
  after_data jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  membership_role text;
  event_id uuid;
begin
  select role into membership_role
  from public.admin_memberships
  where user_id = auth.uid() and active;

  if membership_role is null then
    raise exception 'admin access required';
  end if;

  insert into public.admin_audit_events (
    actor_user_id, actor_role, action, subject_user_id, entity_type,
    entity_id, reason, before_snapshot, after_snapshot
  ) values (
    auth.uid(), membership_role, action_name, subject_id, target_type,
    target_id, action_reason, before_data, after_data
  ) returning id into event_id;

  return event_id;
end;
$$;

revoke all on function public.log_admin_event(text, uuid, text, uuid, text, jsonb, jsonb) from public;
grant execute on function public.log_admin_event(text, uuid, text, uuid, text, jsonb, jsonb) to authenticated;

-- Research admins can read operational participant records. Referral staff receive
-- case-scoped policies when persisted referral cases are added.
create policy "research admins read profiles" on public.profiles
for select using (public.has_admin_role(array['research_admin']));
create policy "research admins read consents" on public.consents
for select using (public.has_admin_role(array['research_admin']));
create policy "research admins read assessments" on public.risk_assessments
for select using (public.has_admin_role(array['research_admin']));
create policy "research admins read periods" on public.menstrual_logs
for select using (public.has_admin_role(array['research_admin']));
create policy "research admins read wellness" on public.daily_wellness_logs
for select using (public.has_admin_role(array['research_admin']));
create policy "research admins read notifications" on public.notification_events
for select using (public.has_admin_role(array['research_admin']));
create policy "research admins read correction requests" on public.assessment_correction_requests
for select using (public.has_admin_role(array['research_admin']));

create index if not exists profiles_admin_status_idx
  on public.profiles(onboarding_complete, created_at desc);
create index if not exists risk_assessments_admin_status_idx
  on public.risk_assessments(record_status, assessment_type, category, created_at desc);
create index if not exists notification_events_admin_status_idx
  on public.notification_events(status, event_type, created_at desc);
create index if not exists admin_audit_events_created_idx
  on public.admin_audit_events(created_at desc);

comment on table public.admin_memberships is 'Controlled database authority for narrow research/referral admin access.';
comment on table public.admin_audit_events is 'Append-only audit of identifiable admin views and mutations.';
