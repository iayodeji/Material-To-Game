-- QuestForge database schema
-- Run this against your Supabase project

-- Enable pgvector extension for semantic caching
create extension if not exists vector;

-- Content sources (URLs, pasted text, uploaded files)
create table if not exists content_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  type text check (type in ('url', 'file', 'text')) not null,
  raw_text text,
  source_url text,
  content_hash text unique,
  knowledge_graph jsonb,
  created_at timestamptz default now()
);

-- Generated games
create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  source_id uuid references content_sources,
  title text not null,
  game_type text not null,
  theme_data jsonb,
  game_spec jsonb,
  html_path text,
  is_public boolean default false,
  completion_data jsonb,
  created_at timestamptz default now()
);

-- User progress tracking
create table if not exists user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  game_id uuid references games,
  scenes_completed text[],
  completed_at timestamptz,
  score int,
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_content_sources_user_id on content_sources(user_id);
create index if not exists idx_games_user_id on games(user_id);
create index if not exists idx_games_created_at on games(created_at desc);
create index if not exists idx_user_progress_game_id on user_progress(game_id);
create index if not exists idx_user_progress_user_id on user_progress(user_id);

-- Row Level Security
alter table content_sources enable row level security;
alter table games enable row level security;
alter table user_progress enable row level security;

-- Policies: users can only see their own data (or public games)
create policy "Users can read own content sources" on content_sources
  for select using (auth.uid() = user_id);

create policy "Users can insert own content sources" on content_sources
  for insert with check (auth.uid() = user_id OR user_id is null);

create policy "Users can read own games" on games
  for select using (auth.uid() = user_id OR is_public = true);

create policy "Users can insert own games" on games
  for insert with check (auth.uid() = user_id OR user_id is null);

create policy "Users can read own progress" on user_progress
  for select using (auth.uid() = user_id);

create policy "Users can upsert own progress" on user_progress
  for all using (auth.uid() = user_id);
