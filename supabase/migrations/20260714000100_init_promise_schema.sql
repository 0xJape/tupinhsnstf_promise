-- P.R.O.M.I.S.E. MVP schema
-- Account-scoped health data. RLS: users can only access own rows.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  date_of_birth date not null,
  sex text not null default 'female' check (sex = 'female'),
  mobile_number text,
  height_cm numeric(5,2) check (height_cm is null or height_cm > 0),
  weight_kg numeric(5,2) check (weight_kg is null or weight_kg > 0),
  waist_cm numeric(5,2) check (waist_cm is null or waist_cm > 0),
  bmi numeric(5,2) generated always as (
    case
      when height_cm is null or weight_kg is null or height_cm <= 0 then null
      else round(weight_kg / ((height_cm / 100) * (height_cm / 100)), 2)
    end
  ) stored,
  activity_level text,
  exercise_frequency text,
  sleep_band text,
  stress_level int check (stress_level is null or stress_level between 1 and 5),
  smoking boolean,
  alcohol_band text,
  diet_habits jsonb not null default '{}'::jsonb,
  medications jsonb not null default '[]'::jsonb,
  conditions text[] not null default '{}',
  family_history text[] not null default '{}',
  onboarding_complete boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  policy_version text not null,
  non_diagnosis boolean not null,
  health_data boolean not null,
  ai_third_party boolean not null,
  notifications boolean not null,
  research_framing boolean not null,
  guardian_consent boolean,
  participant_assent boolean,
  accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint consents_required_true check (
    non_diagnosis and health_data and ai_third_party and notifications and research_framing
  )
);

create table public.menstrual_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  start_date date not null,
  duration_days int check (duration_days is null or duration_days between 1 and 14),
  flow text check (flow is null or flow in ('light', 'medium', 'heavy')),
  pain_level int check (pain_level is null or pain_level between 0 and 10),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, start_date)
);

create table public.risk_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  rule_version text not null default 'pcos-screen-v1',
  answers jsonb not null,
  bmi_at_assessment numeric(5,2),
  item_points jsonb not null default '{}'::jsonb,
  total_score int not null check (total_score >= 0),
  category text not null check (category in ('Low', 'Moderate', 'High')),
  contributing_factors jsonb not null default '[]'::jsonb,
  referral_recommended boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  related_assessment_id uuid references public.risk_assessments(id) on delete set null,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  model text,
  created_at timestamptz not null default now()
);

create table public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  email_enabled boolean not null default true,
  sms_enabled boolean not null default false,
  period_reminders boolean not null default true,
  missed_log_reminders boolean not null default true,
  risk_followups boolean not null default true,
  education_tips boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notification_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  channel text not null check (channel in ('email', 'sms', 'both')),
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  provider_ref text,
  created_at timestamptz not null default now()
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  event_name text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index menstrual_logs_user_start_idx on public.menstrual_logs(user_id, start_date desc);
create index risk_assessments_user_created_idx on public.risk_assessments(user_id, created_at desc);
create index ai_conversations_user_created_idx on public.ai_conversations(user_id, created_at desc);
create index ai_messages_conversation_created_idx on public.ai_messages(conversation_id, created_at);
create index notification_events_user_created_idx on public.notification_events(user_id, created_at desc);
create index analytics_events_name_created_idx on public.analytics_events(event_name, created_at desc);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger menstrual_logs_set_updated_at
before update on public.menstrual_logs
for each row execute function public.set_updated_at();

create trigger ai_conversations_set_updated_at
before update on public.ai_conversations
for each row execute function public.set_updated_at();

create trigger notification_preferences_set_updated_at
before update on public.notification_preferences
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.consents enable row level security;
alter table public.menstrual_logs enable row level security;
alter table public.risk_assessments enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notification_events enable row level security;
alter table public.analytics_events enable row level security;

create policy "profiles own select" on public.profiles
for select using (id = auth.uid());
create policy "profiles own insert" on public.profiles
for insert with check (id = auth.uid());
create policy "profiles own update" on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid());

create policy "consents own select" on public.consents
for select using (user_id = auth.uid());
create policy "consents own insert" on public.consents
for insert with check (user_id = auth.uid());

create policy "menstrual_logs own select" on public.menstrual_logs
for select using (user_id = auth.uid());
create policy "menstrual_logs own insert" on public.menstrual_logs
for insert with check (user_id = auth.uid());
create policy "menstrual_logs own update" on public.menstrual_logs
for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "menstrual_logs own delete" on public.menstrual_logs
for delete using (user_id = auth.uid());

create policy "risk_assessments own select" on public.risk_assessments
for select using (user_id = auth.uid());
create policy "risk_assessments own insert" on public.risk_assessments
for insert with check (user_id = auth.uid());

create policy "ai_conversations own select" on public.ai_conversations
for select using (user_id = auth.uid());
create policy "ai_conversations own insert" on public.ai_conversations
for insert with check (user_id = auth.uid());
create policy "ai_conversations own update" on public.ai_conversations
for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "ai_conversations own delete" on public.ai_conversations
for delete using (user_id = auth.uid());

create policy "ai_messages own select" on public.ai_messages
for select using (
  exists (
    select 1 from public.ai_conversations c
    where c.id = conversation_id and c.user_id = auth.uid()
  )
);
create policy "ai_messages own insert" on public.ai_messages
for insert with check (
  exists (
    select 1 from public.ai_conversations c
    where c.id = conversation_id and c.user_id = auth.uid()
  )
);

create policy "notification_preferences own select" on public.notification_preferences
for select using (user_id = auth.uid());
create policy "notification_preferences own insert" on public.notification_preferences
for insert with check (user_id = auth.uid());
create policy "notification_preferences own update" on public.notification_preferences
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "notification_events own select" on public.notification_events
for select using (user_id = auth.uid());

create policy "analytics_events own insert" on public.analytics_events
for insert with check (user_id is null or user_id = auth.uid());

comment on table public.profiles is 'User profile and health baseline. One row per auth user.';
comment on table public.consents is 'Versioned consent acknowledgments required before full app use.';
comment on table public.menstrual_logs is 'Cycle and period self-report logs.';
comment on table public.risk_assessments is 'Rule-based screening snapshots for reproducible results.';
comment on table public.ai_messages is 'AI chat messages. Minimize health context sent to providers.';
comment on table public.notification_events is 'Audit log for Make.com notification events.';
