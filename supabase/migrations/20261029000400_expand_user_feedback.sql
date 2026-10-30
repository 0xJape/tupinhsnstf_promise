alter table public.user_feedback
  add column usability_rating smallint check (usability_rating between 1 and 5),
  add column accessibility_rating smallint check (accessibility_rating between 1 and 5),
  add column relevance_rating smallint check (relevance_rating between 1 and 5),
  add column feature_identifier text check (char_length(feature_identifier) <= 100);

create policy "user_feedback research admin read"
on public.user_feedback
for select
using (public.has_admin_role(array['research_admin']));