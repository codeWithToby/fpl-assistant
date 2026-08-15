create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  anon_id uuid not null,
  event_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists events_event_name_created_at_idx
  on public.events (event_name, created_at);

create index if not exists events_anon_id_idx
  on public.events (anon_id);

alter table public.events enable row level security;

create policy "Allow public insert" on public.events
  for insert
  to anon
  with check (true);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  email text,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy "Allow public insert" on public.feedback
  for insert
  to anon
  with check (true);
