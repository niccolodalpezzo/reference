-- ============================================================
-- NDP Reference — Schema completo Supabase
-- Da eseguire nel SQL Editor del tuo progetto Supabase
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. PROFILI UTENTE (estende auth.users)
-- ────────────────────────────────────────────────────────────
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  role text not null default 'member' check (role in ('member', 'zone_manager')),
  city text,
  province text,
  zone text,
  zone_manager_id uuid references public.user_profiles(id),
  professional_id text,
  registered_at timestamptz default now()
);
alter table public.user_profiles enable row level security;

create policy "Lettura profilo proprio" on public.user_profiles
  for select using (auth.uid() = id);
create policy "Lettura members for zone_manager" on public.user_profiles
  for select using (
    exists (select 1 from public.user_profiles zm where zm.id = auth.uid() and zm.role = 'zone_manager')
  );
create policy "Inserimento profilo" on public.user_profiles
  for insert with check (auth.uid() = id);
create policy "Aggiornamento profilo proprio" on public.user_profiles
  for update using (auth.uid() = id);

-- ────────────────────────────────────────────────────────────
-- 2. WIZARD PROFILES
-- ────────────────────────────────────────────────────────────
create table if not exists public.wizard_profiles (
  user_id uuid references public.user_profiles(id) on delete cascade primary key,
  profile_data jsonb not null default '{}',
  completion_pct integer default 0,
  updated_at timestamptz default now()
);
alter table public.wizard_profiles enable row level security;

create policy "Wizard solo owner" on public.wizard_profiles
  for all using (auth.uid() = user_id);
create policy "Zone manager legge wizard membri" on public.wizard_profiles
  for select using (
    exists (select 1 from public.user_profiles zm where zm.id = auth.uid() and zm.role = 'zone_manager')
  );

-- ────────────────────────────────────────────────────────────
-- 3. PROFESSIONISTI
-- ────────────────────────────────────────────────────────────
create table if not exists public.professionals (
  id text primary key,
  user_id uuid references public.user_profiles(id),
  name text not null,
  profession text not null,
  category text,
  city text not null,
  province text,
  chapter text,
  phone text,
  email text,
  bio text,
  specialties text[] default '{}',
  years_in_bni integer default 0,
  referrals_given integer default 0,
  rating numeric(3,2) default 4.5,
  month_score integer default 50,
  profile_score integer default 0,
  requests_received integer default 0,
  requests_fulfilled integer default 0,
  avg_response_time numeric(5,2) default 24,
  is_top_of_month boolean default false,
  profile_complete boolean default false,
  open_requests integer default 0,
  created_at timestamptz default now()
);
alter table public.professionals enable row level security;
create policy "Professionisti lettura pubblica" on public.professionals for select using (true);
create policy "Professionisti inserimento admin" on public.professionals for insert with check (true);
create policy "Professionisti aggiornamento admin" on public.professionals for update using (true);

-- ────────────────────────────────────────────────────────────
-- 4. CONVERSAZIONI
-- ────────────────────────────────────────────────────────────
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  initiator_id uuid references public.user_profiles(id) not null,
  professional_id text not null,
  subject text,
  status text default 'active' check (status in ('active','archived','resolved','muted')),
  last_message_at timestamptz default now(),
  last_message_preview text default '',
  unread_count integer default 0,
  created_at timestamptz default now()
);
alter table public.conversations enable row level security;

create policy "Lettura conversazioni proprie" on public.conversations
  for select using (initiator_id = auth.uid());
create policy "Inserimento conversazioni" on public.conversations
  for insert with check (initiator_id = auth.uid());
create policy "Aggiornamento conversazioni" on public.conversations
  for update using (initiator_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- 5. MESSAGGI
-- ────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.user_profiles(id),
  sender_name text not null,
  content text not null default '',
  type text default 'text' check (type in ('text','system','reference_card','attachment')),
  status text default 'sent' check (status in ('sent','delivered','read')),
  attachment_name text,
  attachment_size text,
  reference_id uuid,
  sent_at timestamptz default now()
);
alter table public.messages enable row level security;

create policy "Messaggi nelle proprie conversazioni" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.initiator_id = auth.uid()
    )
  );
create policy "Inserimento messaggi" on public.messages
  for insert with check (sender_id = auth.uid() or sender_id is null);

-- ────────────────────────────────────────────────────────────
-- 6. REFERENZE
-- ────────────────────────────────────────────────────────────
create table if not exists public.references (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) not null,
  from_user_id uuid references public.user_profiles(id) not null,
  from_user_name text not null,
  to_professional_id text not null,
  to_professional_name text not null,
  contact_name text not null,
  contact_type text check (contact_type in ('lead','referenza','opportunità')),
  contact_info text,
  notes text,
  urgency text default 'media' check (urgency in ('bassa','media','alta')),
  has_consent boolean default false,
  status text default 'in_verifica' check (status in ('in_verifica','approvata','rifiutata')),
  score_awarded integer default 10,
  reviewed_by_user_id uuid references public.user_profiles(id),
  review_notes text,
  reviewed_at timestamptz,
  created_at timestamptz default now()
);
alter table public.references enable row level security;

create policy "Lettura referenze proprie o zona" on public.references
  for select using (
    from_user_id = auth.uid() or
    exists (select 1 from public.user_profiles up where up.id = auth.uid() and up.role = 'zone_manager')
  );
create policy "Inserimento referenze" on public.references
  for insert with check (from_user_id = auth.uid());
create policy "Approvazione referenze zona" on public.references
  for update using (
    exists (select 1 from public.user_profiles up where up.id = auth.uid() and up.role = 'zone_manager')
  );

-- ────────────────────────────────────────────────────────────
-- 7. LOG ATTIVITÀ
-- ────────────────────────────────────────────────────────────
create table if not exists public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.user_profiles(id) not null,
  user_display_name text,
  type text not null,
  description text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);
alter table public.activity_logs enable row level security;

create policy "Lettura log propri o zona" on public.activity_logs
  for select using (
    user_id = auth.uid() or
    exists (select 1 from public.user_profiles up where up.id = auth.uid() and up.role = 'zone_manager')
  );
create policy "Inserimento log" on public.activity_logs
  for insert with check (user_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- 8. ALERT
-- ────────────────────────────────────────────────────────────
create table if not exists public.alerts (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references public.user_profiles(id) not null,
  member_name text,
  created_by_user_id uuid references public.user_profiles(id) not null,
  title text not null,
  description text,
  severity text default 'warning' check (severity in ('info','warning','critical')),
  status text default 'open' check (status in ('open','closed','archived')),
  closed_notes text,
  closed_at timestamptz,
  created_at timestamptz default now()
);
alter table public.alerts enable row level security;

create policy "Lettura alert" on public.alerts
  for select using (member_id = auth.uid() or created_by_user_id = auth.uid());
create policy "Gestione alert zona" on public.alerts
  for all using (
    exists (select 1 from public.user_profiles up where up.id = auth.uid() and up.role = 'zone_manager')
  );

-- ────────────────────────────────────────────────────────────
-- 9. PREMI
-- ────────────────────────────────────────────────────────────
create table if not exists public.awards (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references public.user_profiles(id) not null,
  member_name text,
  awarded_by_id uuid references public.user_profiles(id) not null,
  awarded_by_name text,
  title text not null,
  description text,
  score_bonus integer default 0,
  created_at timestamptz default now()
);
alter table public.awards enable row level security;

create policy "Lettura premi" on public.awards
  for select using (member_id = auth.uid() or awarded_by_id = auth.uid());
create policy "Assegnazione premi zona" on public.awards
  for all using (
    exists (select 1 from public.user_profiles up where up.id = auth.uid() and up.role = 'zone_manager')
  );

-- ────────────────────────────────────────────────────────────
-- 10. REALTIME
-- ────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
