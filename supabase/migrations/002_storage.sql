-- Storage bucket setup for QuestForge
-- Run this in your Supabase SQL editor after the initial schema

-- Create games storage bucket
insert into storage.buckets (id, name, public)
values ('games', 'games', false)
on conflict (id) do nothing;

-- Storage policies
create policy "Authenticated users can upload games"
  on storage.objects for insert
  with check (bucket_id = 'games');

create policy "Anyone can read public games"
  on storage.objects for select
  using (bucket_id = 'games');
