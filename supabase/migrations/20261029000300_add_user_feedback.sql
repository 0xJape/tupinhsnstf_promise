create table if not exists public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  helpful text not null check (helpful in ('yes', 'somewhat', 'no')),
  comments text,
  created_at timestamptz not null default now()
);

alter table public.user_feedback enable row level security;
create policy "user_feedback own insert" on public.user_feedback for insert with check (auth.uid() = user_id);
create policy "user_feedback own select" on public.user_feedback for select using (auth.uid() = user_id);
