-- ============================================================
-- NDP Reference — Crea 20 Responsabili di Zona
-- Incolla TUTTO questo blocco nel SQL Editor di Supabase
-- e premi "Run"
-- ============================================================

-- Step 1: Aggiungi colonne territoriali (se non esistono già)
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS capoluogo text;

-- Step 2: Crea i 20 account Responsabili
DO $$
DECLARE
  r    RECORD;
  v_id UUID;
  responsabili JSONB := '[
    {"email":"resp.aosta@ndp.it",      "nome":"Lorenzo Bonvin",      "capoluogo":"Aosta",       "regione":"Valle d''Aosta",          "pw":"NdpRef@AO24"},
    {"email":"resp.torino@ndp.it",     "nome":"Matteo Gallo",         "capoluogo":"Torino",      "regione":"Piemonte",                "pw":"NdpRef@TO24"},
    {"email":"resp.genova@ndp.it",     "nome":"Stefano Ruffini",      "capoluogo":"Genova",      "regione":"Liguria",                 "pw":"NdpRef@GE24"},
    {"email":"resp.milano@ndp.it",     "nome":"Andrea Moretti",       "capoluogo":"Milano",      "regione":"Lombardia",               "pw":"NdpRef@MI24"},
    {"email":"resp.trento@ndp.it",     "nome":"Marco Dallapiccola",   "capoluogo":"Trento",      "regione":"Trentino-Alto Adige",     "pw":"NdpRef@TN24"},
    {"email":"resp.venezia@ndp.it",    "nome":"Gianluca Ferraro",     "capoluogo":"Venezia",     "regione":"Veneto",                  "pw":"NdpRef@VE24"},
    {"email":"resp.trieste@ndp.it",    "nome":"Roberto Manzini",      "capoluogo":"Trieste",     "regione":"Friuli-Venezia Giulia",   "pw":"NdpRef@TS24"},
    {"email":"resp.bologna@ndp.it",    "nome":"Filippo Gentile",      "capoluogo":"Bologna",     "regione":"Emilia-Romagna",          "pw":"NdpRef@BO24"},
    {"email":"resp.firenze@ndp.it",    "nome":"Leonardo Tosi",        "capoluogo":"Firenze",     "regione":"Toscana",                 "pw":"NdpRef@FI24"},
    {"email":"resp.ancona@ndp.it",     "nome":"Simone Bartolini",     "capoluogo":"Ancona",      "regione":"Marche",                  "pw":"NdpRef@AN24"},
    {"email":"resp.perugia@ndp.it",    "nome":"Davide Cenci",         "capoluogo":"Perugia",     "regione":"Umbria",                  "pw":"NdpRef@PG24"},
    {"email":"resp.roma@ndp.it",       "nome":"Francesco Romano",     "capoluogo":"Roma",        "regione":"Lazio",                   "pw":"NdpRef@RM24"},
    {"email":"resp.aquila@ndp.it",     "nome":"Alessio Palumbo",      "capoluogo":"L''Aquila",   "regione":"Abruzzo",                 "pw":"NdpRef@AQ24"},
    {"email":"resp.campobasso@ndp.it", "nome":"Antonio Ianiro",       "capoluogo":"Campobasso",  "regione":"Molise",                  "pw":"NdpRef@CB24"},
    {"email":"resp.napoli@ndp.it",     "nome":"Giuseppe Esposito",    "capoluogo":"Napoli",      "regione":"Campania",                "pw":"NdpRef@NA24"},
    {"email":"resp.potenza@ndp.it",    "nome":"Rocco Marrese",        "capoluogo":"Potenza",     "regione":"Basilicata",              "pw":"NdpRef@PZ24"},
    {"email":"resp.bari@ndp.it",       "nome":"Nicola Montanaro",     "capoluogo":"Bari",        "regione":"Puglia",                  "pw":"NdpRef@BA24"},
    {"email":"resp.catanzaro@ndp.it",  "nome":"Vincenzo Russo",       "capoluogo":"Catanzaro",   "regione":"Calabria",                "pw":"NdpRef@CZ24"},
    {"email":"resp.palermo@ndp.it",    "nome":"Salvatore Amato",      "capoluogo":"Palermo",     "regione":"Sicilia",                 "pw":"NdpRef@PA24"},
    {"email":"resp.cagliari@ndp.it",   "nome":"Pietro Melis",         "capoluogo":"Cagliari",    "regione":"Sardegna",                "pw":"NdpRef@CA24"}
  ]';
BEGIN
  FOR r IN
    SELECT *
    FROM jsonb_to_recordset(responsabili)
      AS x(email text, nome text, capoluogo text, regione text, pw text)
  LOOP
    -- Cerca utente già esistente
    SELECT id INTO v_id FROM auth.users WHERE email = r.email;

    IF v_id IS NULL THEN
      -- Crea nuovo utente auth
      v_id := gen_random_uuid();

      INSERT INTO auth.users (
        instance_id, id, aud, role,
        email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data,
        is_super_admin, confirmation_token,
        recovery_token, email_change_token_new, email_change
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_id, 'authenticated', 'authenticated',
        r.email,
        crypt(r.pw, gen_salt('bf')),
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('name', r.nome),
        false, '', '', '', ''
      );

      -- Crea identità email (necessaria per il login)
      INSERT INTO auth.identities (
        id, user_id, identity_data,
        provider, provider_id,
        last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        v_id,
        jsonb_build_object(
          'sub',            v_id::text,
          'email',          r.email,
          'email_verified', true,
          'phone_verified', false
        ),
        'email', r.email,
        now(), now(), now()
      );

      RAISE NOTICE 'Creato: %', r.email;
    ELSE
      -- Aggiorna password e metadati
      UPDATE auth.users SET
        encrypted_password  = crypt(r.pw, gen_salt('bf')),
        email_confirmed_at  = now(),
        raw_user_meta_data  = jsonb_build_object('name', r.nome)
      WHERE id = v_id;

      RAISE NOTICE 'Aggiornato: %', r.email;
    END IF;

    -- Upsert profilo nella tabella applicativa
    INSERT INTO public.user_profiles (
      id, name, role,
      city, province, region, capoluogo, zone,
      zone_manager_id, professional_id
    ) VALUES (
      v_id, r.nome, 'zone_manager',
      r.capoluogo, r.capoluogo, r.regione, r.capoluogo, r.regione,
      NULL, NULL
    )
    ON CONFLICT (id) DO UPDATE SET
      name      = r.nome,
      role      = 'zone_manager',
      city      = r.capoluogo,
      province  = r.capoluogo,
      region    = r.regione,
      capoluogo = r.capoluogo,
      zone      = r.regione;

  END LOOP;

  RAISE NOTICE '✅ 20 Responsabili creati/aggiornati con successo.';
END $$;
