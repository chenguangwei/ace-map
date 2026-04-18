create extension if not exists pgcrypto;

create table if not exists public.game_sessions (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	client_session_id text not null,
	result_code text not null,
	topic_slug text,
	score integer not null check (score >= 0),
	total integer not null check (total >= 0),
	accuracy integer not null check (accuracy between 0 and 100),
	time_seconds integer not null default 0 check (time_seconds >= 0),
	best_streak integer not null default 0 check (best_streak >= 0),
	is_daily_challenge boolean not null default false,
	completed_at timestamptz not null default timezone('utc', now()),
	created_at timestamptz not null default timezone('utc', now()),
	updated_at timestamptz not null default timezone('utc', now()),
	unique (user_id, client_session_id)
);

create table if not exists public.daily_challenge_completions (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	challenge_date date not null,
	topic_slug text not null,
	score integer not null check (score >= 0),
	total integer not null check (total >= 0),
	accuracy integer not null check (accuracy between 0 and 100),
	completed_at timestamptz not null default timezone('utc', now()),
	created_at timestamptz not null default timezone('utc', now()),
	updated_at timestamptz not null default timezone('utc', now()),
	unique (user_id, challenge_date)
);

create table if not exists public.mistake_entries (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	topic_slug text not null,
	place_name text not null,
	place_latitude double precision not null,
	place_longitude double precision not null,
	distance_meters double precision not null check (distance_meters >= 0),
	resolved boolean not null default false,
	resolved_at timestamptz,
	created_at timestamptz not null default timezone('utc', now()),
	updated_at timestamptz not null default timezone('utc', now()),
	unique (
		user_id,
		topic_slug,
		place_name,
		place_latitude,
		place_longitude
	)
);

create table if not exists public.user_profiles (
	user_id uuid primary key references auth.users(id) on delete cascade,
	display_name text,
	avatar_url text,
	is_public_on_leaderboard boolean not null default true,
	created_at timestamptz not null default timezone('utc', now()),
	updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.daily_challenges (
	challenge_date date primary key,
	topic_slug text not null,
	title_override text,
	status text not null default 'active' check (status in ('scheduled', 'active', 'archived')),
	leaderboard_enabled boolean not null default true,
	created_at timestamptz not null default timezone('utc', now()),
	updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.daily_challenge_scores (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	challenge_date date not null,
	topic_slug text not null,
	score integer not null check (score >= 0),
	total integer not null check (total >= 0),
	accuracy integer not null check (accuracy between 0 and 100),
	time_seconds integer not null default 0 check (time_seconds >= 0),
	average_distance_meters double precision check (average_distance_meters >= 0),
	created_at timestamptz not null default timezone('utc', now()),
	updated_at timestamptz not null default timezone('utc', now()),
	unique (user_id, challenge_date)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = timezone('utc', now());
	return new;
end;
$$;

drop trigger if exists game_sessions_set_updated_at on public.game_sessions;
create trigger game_sessions_set_updated_at
before update on public.game_sessions
for each row
execute function public.set_updated_at();

drop trigger if exists daily_challenge_completions_set_updated_at on public.daily_challenge_completions;
create trigger daily_challenge_completions_set_updated_at
before update on public.daily_challenge_completions
for each row
execute function public.set_updated_at();

drop trigger if exists mistake_entries_set_updated_at on public.mistake_entries;
create trigger mistake_entries_set_updated_at
before update on public.mistake_entries
for each row
execute function public.set_updated_at();

drop trigger if exists user_profiles_set_updated_at on public.user_profiles;
create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row
execute function public.set_updated_at();

drop trigger if exists daily_challenges_set_updated_at on public.daily_challenges;
create trigger daily_challenges_set_updated_at
before update on public.daily_challenges
for each row
execute function public.set_updated_at();

drop trigger if exists daily_challenge_scores_set_updated_at on public.daily_challenge_scores;
create trigger daily_challenge_scores_set_updated_at
before update on public.daily_challenge_scores
for each row
execute function public.set_updated_at();

alter table public.game_sessions enable row level security;
alter table public.daily_challenge_completions enable row level security;
alter table public.mistake_entries enable row level security;
alter table public.user_profiles enable row level security;
alter table public.daily_challenges enable row level security;
alter table public.daily_challenge_scores enable row level security;

drop policy if exists "game_sessions_select_own" on public.game_sessions;
create policy "game_sessions_select_own"
on public.game_sessions
for select
using (auth.uid() = user_id);

drop policy if exists "game_sessions_insert_own" on public.game_sessions;
create policy "game_sessions_insert_own"
on public.game_sessions
for insert
with check (auth.uid() = user_id);

drop policy if exists "game_sessions_update_own" on public.game_sessions;
create policy "game_sessions_update_own"
on public.game_sessions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "daily_challenge_completions_select_own" on public.daily_challenge_completions;
create policy "daily_challenge_completions_select_own"
on public.daily_challenge_completions
for select
using (auth.uid() = user_id);

drop policy if exists "daily_challenge_completions_insert_own" on public.daily_challenge_completions;
create policy "daily_challenge_completions_insert_own"
on public.daily_challenge_completions
for insert
with check (auth.uid() = user_id);

drop policy if exists "daily_challenge_completions_update_own" on public.daily_challenge_completions;
create policy "daily_challenge_completions_update_own"
on public.daily_challenge_completions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "mistake_entries_select_own" on public.mistake_entries;
create policy "mistake_entries_select_own"
on public.mistake_entries
for select
using (auth.uid() = user_id);

drop policy if exists "mistake_entries_insert_own" on public.mistake_entries;
create policy "mistake_entries_insert_own"
on public.mistake_entries
for insert
with check (auth.uid() = user_id);

drop policy if exists "mistake_entries_update_own" on public.mistake_entries;
create policy "mistake_entries_update_own"
on public.mistake_entries
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_profiles_select_signed_in" on public.user_profiles;
create policy "user_profiles_select_signed_in"
on public.user_profiles
for select
using (auth.role() = 'authenticated');

drop policy if exists "user_profiles_insert_own" on public.user_profiles;
create policy "user_profiles_insert_own"
on public.user_profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "user_profiles_update_own" on public.user_profiles;
create policy "user_profiles_update_own"
on public.user_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "daily_challenges_select_signed_in" on public.daily_challenges;
create policy "daily_challenges_select_signed_in"
on public.daily_challenges
for select
using (auth.role() = 'authenticated');

drop policy if exists "daily_challenge_scores_select_signed_in" on public.daily_challenge_scores;
create policy "daily_challenge_scores_select_signed_in"
on public.daily_challenge_scores
for select
using (auth.role() = 'authenticated');

drop policy if exists "daily_challenge_scores_insert_own" on public.daily_challenge_scores;
create policy "daily_challenge_scores_insert_own"
on public.daily_challenge_scores
for insert
with check (auth.uid() = user_id);

drop policy if exists "daily_challenge_scores_update_own" on public.daily_challenge_scores;
create policy "daily_challenge_scores_update_own"
on public.daily_challenge_scores
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
