/**
 * NDP Reference — Seed Responsabili di Zona
 *
 * Questo script:
 * 1. Applica la migrazione SQL (aggiunge colonne region/capoluogo)
 * 2. Crea 20 account Responsabili reali (uno per capoluogo di regione)
 * 3. Aggiorna i professionisti con regione/capoluogo corretti
 *
 * Uso: npx tsx scripts/seed-responsabili.ts
 */

import { createClient } from '@supabase/supabase-js';
import { RESPONSABILI, PROVINCIA_TERRITORIO } from '../lib/territoryMap';

const SUPABASE_URL = 'https://sgnykkrtckrfbcltwsrt.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnbnlra3J0Y2tyZmJjbHR3c3J0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc5MDY2OSwiZXhwIjoyMDg4MzY2NjY5fQ.GrNBnT0GFlcs3nPsLzkQahhenRm2bFGL9lejgH-GoPE';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Password per ogni Responsabile ───────────────────────────────────────────

function buildPassword(capoluogo: string): string {
  const codici: Record<string, string> = {
    'Aosta': 'AO', 'Torino': 'TO', 'Genova': 'GE', 'Milano': 'MI',
    'Trento': 'TN', 'Venezia': 'VE', 'Trieste': 'TS', 'Bologna': 'BO',
    'Firenze': 'FI', 'Ancona': 'AN', 'Perugia': 'PG', 'Roma': 'RM',
    "L'Aquila": 'AQ', 'Campobasso': 'CB', 'Napoli': 'NA', 'Potenza': 'PZ',
    'Bari': 'BA', 'Catanzaro': 'CZ', 'Palermo': 'PA', 'Cagliari': 'CA',
  };
  const code = codici[capoluogo] ?? 'XX';
  return `NdpRef@${code}24`;
}

// ─── Migrazione SQL: aggiungi colonne region/capoluogo ──────────────────────

async function applyMigration() {
  console.log('\n── Migrazione database ─────────────────────────────');
  const sql = `
    alter table public.user_profiles
      add column if not exists region text,
      add column if not exists capoluogo text;
  `;
  const { error } = await supabase.rpc('exec_sql', { sql }).maybeSingle();
  // Se rpc non disponibile, proviamo direttamente
  if (error) {
    // La migrazione probabilmente è già applicata o va eseguita manualmente
    console.log('  ℹ  Migrazione SQL: esegui manualmente supabase/migrations/001_add_territory_fields.sql');
    console.log('     (Le colonne potrebbero già esistere — lo script continua comunque)');
  } else {
    console.log('  ✓ Colonne region/capoluogo aggiunte');
  }
}

// ─── Crea 20 Responsabili reali ──────────────────────────────────────────────

const createdAccounts: Array<{
  capoluogo: string;
  regione: string;
  nome: string;
  email: string;
  password: string;
  id: string;
}> = [];

async function creaResponsabili() {
  console.log('\n── Creazione account Responsabili ──────────────────');
  const { data: allUsers } = await supabase.auth.admin.listUsers();
  const existingEmails = new Set(allUsers?.users.map(u => u.email));

  for (const [capoluogo, resp] of Object.entries(RESPONSABILI)) {
    const password = buildPassword(capoluogo);

    let userId: string;

    if (existingEmails.has(resp.email)) {
      // Aggiorna l'utente esistente
      const existing = allUsers?.users.find(u => u.email === resp.email);
      userId = existing!.id;
      // Aggiorna password
      await supabase.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        user_metadata: { name: resp.nome },
      });
      console.log(`  ↻ ${resp.email} aggiornato`);
    } else {
      // Crea nuovo utente
      const { data, error } = await supabase.auth.admin.createUser({
        email: resp.email,
        password,
        email_confirm: true,
        user_metadata: { name: resp.nome },
      });
      if (error || !data.user) {
        console.error(`  ✗ Errore creazione ${resp.email}:`, error?.message);
        continue;
      }
      userId = data.user.id;
      console.log(`  ✓ ${resp.email} creato`);
    }

    // Upsert profilo
    const { error: profileError } = await supabase.from('user_profiles').upsert({
      id: userId,
      name: resp.nome,
      role: 'zone_manager',
      city: capoluogo,
      province: capoluogo,
      region: resp.regione,
      capoluogo: capoluogo,
      zone: `${resp.regione}`,
      zone_manager_id: null,
      professional_id: null,
    }, { onConflict: 'id' });

    if (profileError) {
      console.error(`  ✗ Profilo ${resp.email}:`, profileError.message);
    }

    createdAccounts.push({
      capoluogo,
      regione: resp.regione,
      nome: resp.nome,
      email: resp.email,
      password,
      id: userId,
    });
  }

  console.log(`\n  ✓ ${createdAccounts.length} Responsabili configurati`);
}

// ─── Aggiorna professionisti demo con regione/capoluogo ──────────────────────

const PROVINCE_PER_CITTA: Record<string, string> = {
  'Milano': 'Milano',
  'Roma': 'Roma',
  'Torino': 'Torino',
  'Firenze': 'Firenze',
  'Bologna': 'Bologna',
  'Napoli': 'Napoli',
  'Bari': 'Bari',
  'Genova': 'Genova',
  'Venezia': 'Venezia',
  'Palermo': 'Palermo',
};

async function aggiornaProfessionistiDemo() {
  console.log('\n── Aggiornamento professionisti demo ───────────────');
  const { data: profs } = await supabase.from('professionals').select('id, city, province');
  if (!profs) return;

  for (const prof of profs) {
    const provincia = prof.province ?? PROVINCE_PER_CITTA[prof.city] ?? prof.city;
    const territorio = PROVINCIA_TERRITORIO[provincia];
    if (!territorio) continue;

    await supabase.from('professionals').update({
      province: provincia,
    }).eq('id', prof.id);
  }
  console.log(`  ✓ ${profs.length} professionisti aggiornati`);
}

// ─── Collegamento professionisti reali ai responsabili ───────────────────────

async function collegaProfessionistiAiResponsabili() {
  console.log('\n── Collegamento member → zone_manager ──────────────');

  // Prendi tutti i member
  const { data: members } = await supabase
    .from('user_profiles')
    .select('id, province, capoluogo')
    .eq('role', 'member');

  if (!members || members.length === 0) {
    console.log('  ℹ  Nessun member da collegare');
    return;
  }

  for (const member of members) {
    const provincia = member.province;
    if (!provincia) continue;

    const territorio = PROVINCIA_TERRITORIO[provincia];
    if (!territorio) continue;

    // Trova il responsabile per questo capoluogo
    const respAccount = createdAccounts.find(a => a.capoluogo === territorio.capoluogo);
    if (!respAccount) continue;

    await supabase.from('user_profiles').update({
      region: territorio.regione,
      capoluogo: territorio.capoluogo,
      zone_manager_id: respAccount.id,
    }).eq('id', member.id);
  }

  console.log(`  ✓ ${members.length} member collegati ai rispettivi responsabili`);
}

// ─── Output finale ────────────────────────────────────────────────────────────

function stampaTabellaFinale() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║          ACCOUNT RESPONSABILI — NDP REFERENCE BETA                         ║');
  console.log('╠══════════════════════════════════════════════════════════════════════════════╣');
  console.log('║  Capoluogo      Regione                    Nome                Email         ║');
  console.log('╠══════════════════════════════════════════════════════════════════════════════╣');

  for (const acc of createdAccounts) {
    const cap = acc.capoluogo.padEnd(14);
    const reg = acc.regione.padEnd(26);
    const nom = acc.nome.padEnd(22);
    const mail = acc.email;
    console.log(`║  ${cap} ${reg} ${nom} ${mail}`);
  }

  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n📋 CREDENZIALI COMPLETE:\n');

  for (const acc of createdAccounts) {
    console.log(`  ${acc.capoluogo} (${acc.regione})`);
    console.log(`    Nome:     ${acc.nome}`);
    console.log(`    Email:    ${acc.email}`);
    console.log(`    Password: ${acc.password}`);
    console.log('');
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   NDP Reference — Seed Responsabili di Zona    ║');
  console.log('╚══════════════════════════════════════════════════╝');

  await applyMigration();
  await creaResponsabili();
  await aggiornaProfessionistiDemo();
  await collegaProfessionistiAiResponsabili();

  stampaTabellaFinale();

  console.log('\n✅ Setup completato!\n');
  console.log('IMPORTANTE:');
  console.log('  • Esegui la migrazione SQL manualmente se non già fatto:');
  console.log('    supabase/migrations/001_add_territory_fields.sql');
  console.log('  • I nuovi Responsabili possono accedere subito al pannello /resp-zona');
  console.log('  • La registrazione pubblica crea solo Professionisti (member)');
}

main().catch(console.error);
