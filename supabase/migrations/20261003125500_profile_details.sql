alter table public.profiles
  add column gender text check (gender in ('male', 'female', 'non_binary', 'prefer_not_to_say')),
  add column institutional_id text unique;
