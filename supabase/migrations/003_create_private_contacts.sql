-- ============================================================
-- 003: Contatti privati del professionista
-- ============================================================

create table if not exists public.private_contacts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  nome text not null,
  cognome text not null default '',
  professione text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Anti-duplicati: stesso nome+cognome+professione per lo stesso utente
create unique index idx_private_contacts_unique
  on public.private_contacts (user_id, lower(nome), lower(cognome), lower(professione));

-- Indice per lookup per utente
create index idx_private_contacts_user on public.private_contacts(user_id);

-- Indice per ricerca AI per professione
create index idx_private_contacts_professione
  on public.private_contacts using gin(to_tsvector('italian', professione));

-- RLS: solo il proprietario legge/scrive i propri contatti
alter table public.private_contacts enable row level security;

create policy "Contatti privati solo owner"
  on public.private_contacts
  for all
  using (auth.uid() = user_id);
