-- ============================================================
-- NDP Reference — Migrazione: aggiunta campi territoriali
-- Da eseguire nel SQL Editor di Supabase
-- ============================================================

-- Aggiunge region e capoluogo a user_profiles (se non già presenti)
alter table public.user_profiles
  add column if not exists region text,
  add column if not exists capoluogo text;

-- Commento descrittivo
comment on column public.user_profiles.region is 'Regione italiana del professionista (derivata dalla provincia)';
comment on column public.user_profiles.capoluogo is 'Capoluogo di regione: per il professionista indica il responsabile assegnato; per zone_manager indica il territorio gestito';
