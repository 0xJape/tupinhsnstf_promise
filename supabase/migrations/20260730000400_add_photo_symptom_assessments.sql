-- Store only constrained educational observations derived from transient photos.
-- Photo bytes, filenames, EXIF, embeddings, and unrestricted model prose are never stored.

create table if not exists public.photo_symptom_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  baseline_assessment_id uuid not null references public.risk_assessments(id) on delete restrict,
  acne_like_spots text not null check (acne_like_spots in ('not_observed', 'possibly_observed', 'unclear')),
  coarse_facial_hair text not null check (coarse_facial_hair in ('not_observed', 'possibly_observed', 'unclear')),
  image_quality text not null check (image_quality in ('adequate', 'limited', 'unusable')),
  limitations text[] not null default '{}',
  assessment_version text not null default 'photo-symptom-v1',
  provider_model text not null,
  consented_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (cardinality(limitations) <= 5)
);

create index if not exists photo_symptom_assessments_user_created_idx
  on public.photo_symptom_assessments(user_id, created_at desc);

alter table public.photo_symptom_assessments enable row level security;

create policy "photo symptom assessments own select" on public.photo_symptom_assessments
for select using (user_id = auth.uid());

create policy "photo symptom assessments own insert" on public.photo_symptom_assessments
for insert with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.risk_assessments assessment
    where assessment.id = baseline_assessment_id
      and assessment.user_id = auth.uid()
      and assessment.assessment_type = 'baseline'
      and assessment.record_status = 'valid'
  )
);

comment on table public.photo_symptom_assessments is 'Participant-only educational observations derived from transient photos; contains no image, diagnosis, severity, or screening-score input.';
