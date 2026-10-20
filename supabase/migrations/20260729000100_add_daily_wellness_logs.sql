-- One private, self-reported daily wellness entry per user and local calendar date.
-- Deliberately excludes images, diagnoses, and automated clinical conclusions.

create table public.daily_wellness_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null,
  pain_level int check (pain_level is null or pain_level between 0 and 10),
  fatigue_level int check (fatigue_level is null or fatigue_level between 0 and 10),
  mood text check (mood is null or mood in ('low', 'okay', 'good')),
  acne_change text check (acne_change is null or acne_change in ('none', 'mild', 'moderate', 'severe')),
  sleep_hours numeric(3,1) check (sleep_hours is null or sleep_hours between 0 and 24),
  activity_minutes int check (activity_minutes is null or activity_minutes between 0 and 1440),
  stress_level int check (stress_level is null or stress_level between 1 and 5),
  notes text check (notes is null or char_length(notes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index daily_wellness_logs_user_date_idx
  on public.daily_wellness_logs(user_id, log_date desc);

create trigger daily_wellness_logs_set_updated_at
before update on public.daily_wellness_logs
for each row execute function public.set_updated_at();

alter table public.daily_wellness_logs enable row level security;

create policy "daily_wellness_logs own select" on public.daily_wellness_logs
for select using (user_id = auth.uid());
create policy "daily_wellness_logs own insert" on public.daily_wellness_logs
for insert with check (user_id = auth.uid());
create policy "daily_wellness_logs own update" on public.daily_wellness_logs
for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "daily_wellness_logs own delete" on public.daily_wellness_logs
for delete using (user_id = auth.uid());

comment on table public.daily_wellness_logs is 'Private daily self-reported wellness tracking; not a diagnosis or clinical record.';
