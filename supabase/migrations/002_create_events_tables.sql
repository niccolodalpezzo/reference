-- ============================================================
-- NDP Reference — Migration 002: Events system
-- ============================================================

-- ─── 1. EVENTS ──────────────────────────────────────────────
create table if not exists public.events (
  id             uuid default gen_random_uuid() primary key,
  responsabile_id uuid references public.user_profiles(id) on delete set null,
  titolo         text not null,
  descrizione    text,
  citta          text not null,
  indirizzo      text,
  regione        text,
  data_evento    date not null,
  orario_evento  time not null,
  status         text not null default 'attivo'
                   check (status in ('attivo','passato','annullato')),
  lat            float8,
  lng            float8,
  created_at     timestamptz default now()
);

alter table public.events enable row level security;

-- Anyone (including anon) can read events
create policy "Events lettura pubblica"
  on public.events for select using (true);

-- Only zone managers can insert events
create policy "Events inserimento zona"
  on public.events for insert
  with check (
    exists (
      select 1 from public.user_profiles up
      where up.id = auth.uid() and up.role = 'zone_manager'
    )
  );

-- Zone managers can update their own events
create policy "Events modifica zona"
  on public.events for update
  using (
    responsabile_id = auth.uid() and
    exists (
      select 1 from public.user_profiles up
      where up.id = auth.uid() and up.role = 'zone_manager'
    )
  );

-- Zone managers can delete their own events
create policy "Events eliminazione zona"
  on public.events for delete
  using (
    responsabile_id = auth.uid() and
    exists (
      select 1 from public.user_profiles up
      where up.id = auth.uid() and up.role = 'zone_manager'
    )
  );

-- ─── 2. EVENT REGISTRATIONS ─────────────────────────────────
create table if not exists public.event_registrations (
  id                uuid default gen_random_uuid() primary key,
  event_id          uuid references public.events(id) on delete cascade not null,
  professionista_id uuid references public.user_profiles(id) on delete cascade not null,
  created_at        timestamptz default now(),
  unique (event_id, professionista_id)
);

alter table public.event_registrations enable row level security;

-- Members can read their own registrations; zone managers read all
create policy "Registrations lettura"
  on public.event_registrations for select
  using (
    professionista_id = auth.uid() or
    exists (
      select 1 from public.user_profiles up
      where up.id = auth.uid() and up.role = 'zone_manager'
    )
  );

-- Authenticated members can register themselves
create policy "Registrations inserimento"
  on public.event_registrations for insert
  with check (professionista_id = auth.uid());

-- Members can delete their own registration (unregister)
create policy "Registrations cancellazione"
  on public.event_registrations for delete
  using (professionista_id = auth.uid());

-- ─── 3. INDEXES ─────────────────────────────────────────────
create index if not exists idx_events_data_evento on public.events (data_evento);
create index if not exists idx_events_status on public.events (status);
create index if not exists idx_events_regione on public.events (regione);
create index if not exists idx_event_registrations_event_id on public.event_registrations (event_id);
create index if not exists idx_event_registrations_professionista_id on public.event_registrations (professionista_id);
