-- Let research admins include derived photo observations in audited participant summaries.
-- Image bytes do not exist in application storage; referral staff remain excluded.

create policy "research admins read photo symptom assessments"
on public.photo_symptom_assessments
for select using (public.has_admin_role(array['research_admin']));
