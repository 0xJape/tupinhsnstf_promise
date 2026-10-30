create table public.clinician_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question text not null check (char_length(question) between 1 and 500),
  created_at timestamptz not null default now()
);

create index clinician_questions_user_created_idx on public.clinician_questions(user_id, created_at desc);
alter table public.clinician_questions enable row level security;
create policy "clinician_questions own select" on public.clinician_questions for select using (user_id = auth.uid());
create policy "clinician_questions own insert" on public.clinician_questions for insert with check (user_id = auth.uid());
create policy "clinician_questions own delete" on public.clinician_questions for delete using (user_id = auth.uid());
comment on table public.clinician_questions is 'Private questions saved by user for healthcare discussions.';