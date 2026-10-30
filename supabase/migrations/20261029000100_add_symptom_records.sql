create table public.symptom_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  symptom text not null check (char_length(symptom) between 1 and 80),
  body_area text not null check (char_length(body_area) between 1 and 80),
  occurred_on date not null,
  severity int not null check (severity between 1 and 5),
  frequency text not null check (frequency in ('once', 'occasional', 'frequent', 'constant')),
  duration text,
  change text not null check (change in ('improved', 'same', 'worsened')),
  notes text check (notes is null or char_length(notes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index symptom_records_user_date_idx on public.symptom_records(user_id, occurred_on desc);
alter table public.symptom_records enable row level security;
create policy "symptom_records own select" on public.symptom_records for select using (user_id = auth.uid());
create policy "symptom_records own insert" on public.symptom_records for insert with check (user_id = auth.uid());
create policy "symptom_records own update" on public.symptom_records for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "symptom_records own delete" on public.symptom_records for delete using (user_id = auth.uid());
create trigger symptom_records_set_updated_at before update on public.symptom_records for each row execute function public.set_updated_at();
comment on table public.symptom_records is 'Private self-reported symptom tracking. Not diagnostic.';
