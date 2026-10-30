create table if not exists public.safety_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  checkin_date date not null default current_date,
  status text not null check (status in ('safe', 'need_support')),
  created_at timestamptz not null default now(),
  unique (user_id, checkin_date)
);

alter table public.safety_checkins enable row level security;

create policy "safety checkins own select" on public.safety_checkins
  for select using (auth.uid() = user_id);
create policy "safety checkins own insert" on public.safety_checkins
  for insert with check (auth.uid() = user_id);
create policy "safety checkins own update" on public.safety_checkins
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
