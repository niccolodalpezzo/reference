/**
 * NDP Reference — Setup Script
 * Crea utenti demo + inserisce professionisti in Supabase
 *
 * Uso: npx tsx scripts/setup-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = 'https://sgnykkrtckrfbcltwsrt.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnbnlra3J0Y2tyZmJjbHR3c3J0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc5MDY2OSwiZXhwIjoyMDg4MzY2NjY5fQ.GrNBnT0GFlcs3nPsLzkQahhenRm2bFGL9lejgH-GoPE';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ─── Demo Users ────────────────────────────────────────────
const DEMO_USERS = [
  {
    email: 'marco@ndp.it',
    password: 'demo1234',
    name: 'Marco Mastella',
    role: 'member' as const,
    city: 'Milano',
    province: 'Milano',
    zone: 'Zona Nord',
    professional_id: 'demo-marco',
  },
  {
    email: 'luca@ndp.it',
    password: 'demo1234',
    name: 'Luca Ferrari',
    role: 'zone_manager' as const,
    city: 'Milano',
    province: 'Milano',
    zone: 'Zona Nord',
    professional_id: null,
  },
];

// ─── Province → Zona mapping ────────────────────────────────
const PROVINCE_ZONE_MAP: Record<string, string> = {
  'Milano': 'Zona Nord',
  'Monza e Brianza': 'Zona Nord',
  'Bergamo': 'Zona Nord',
  'Brescia': 'Zona Nord',
  'Como': 'Zona Nord',
  'Varese': 'Zona Nord',
  'Lecco': 'Zona Nord',
  'Torino': 'Zona Nord-Ovest',
  'Roma': 'Zona Centro',
  'Napoli': 'Zona Sud',
  'Palermo': 'Zona Sud',
};

async function createDemoUsers() {
  console.log('\n── Creazione utenti demo ──────────────────────────');
  let lucaId: string | null = null;

  for (const u of DEMO_USERS) {
    // Check if user already exists
    const { data: existing } = await supabase.auth.admin.listUsers();
    const found = existing?.users.find(x => x.email === u.email);

    let userId: string;
    if (found) {
      console.log(`  ✓ ${u.email} già esistente (${found.id})`);
      userId = found.id;
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { name: u.name },
      });
      if (error) {
        console.error(`  ✗ ${u.email}:`, error.message);
        continue;
      }
      userId = data.user!.id;
      console.log(`  ✓ ${u.email} creato (${userId})`);
    }

    if (u.role === 'zone_manager') lucaId = userId;

    // Upsert user_profile
    await supabase.from('user_profiles').upsert({
      id: userId,
      name: u.name,
      role: u.role,
      city: u.city,
      province: u.province,
      zone: u.zone,
      zone_manager_id: u.role === 'zone_manager' ? null : undefined,
      professional_id: u.professional_id,
    });
  }

  // Link Marco to Luca as zone manager
  if (lucaId) {
    const { data: marco } = await supabase.auth.admin.listUsers();
    const marcoUser = marco?.users.find(x => x.email === 'marco@ndp.it');
    if (marcoUser) {
      await supabase.from('user_profiles').update({ zone_manager_id: lucaId }).eq('id', marcoUser.id);
      console.log(`  ✓ Marco collegato a Luca come zone_manager`);
    }
  }
}

// ─── Marco's wizard profile ─────────────────────────────────
const marcoProfile = {
  firstName: 'Marco',
  lastName: 'Mastella',
  photoUrl: '',
  businessName: 'Studio Legale Mastella',
  yearsExperience: 12,
  cities: ['Milano', 'Monza'],
  sectors: ['Diritto commerciale', 'Contrattualistica', 'M&A', 'Proprietà intellettuale'],
  mainServices: [
    'Redazione e revisione contratti commerciali',
    'Consulenza su fusioni e acquisizioni (M&A)',
    'Tutela marchi e brevetti',
    'Contenzioso civile e arbitrato',
  ],
  typicalCases: 'Startup in fase di raccolta fondi. PMI che vogliono espandersi in mercati esteri. Aziende che devono tutelare il proprio brand.',
  triggerPhrases: ['contratto','accordo commerciale','fusione','acquisizione','marchio','brevetto','startup','NDA'],
  goals: 'Diventare il riferimento legale per le PMI milanesi che vogliono crescere.',
  achievements: 'Ho supportato 3 startup nel loro seed round (€8M raccolti). Ho assistito un\'azienda nell\'acquisizione di un competitor (€15M).',
  interests: 'Tennis, lettura di saggi di economia, LegalTech.',
  networks: 'BNI Milano Centro, Confindustria Milano, Alumni UniBocconi.',
  skills: 'Negoziazione avanzata, contratti internazionali, due diligence, mediazione civile.',
  idealClientProfile: 'PMI con fatturato 1–50M€ nel settore tech, manifatturiero o servizi.',
  topClients: [{ name: 'TechStartup Srl', sector: 'SaaS', description: 'Supporto raccolta fondi seed €3M' }],
  goodReference: 'Cliente che porta un contatto specifico con un bisogno concreto e urgente.',
  badReference: 'Cliente che porta una persona senza un problema definito o senza urgenza.',
  otherSources: 'LinkedIn, eventi Confindustria, referral da commercialisti partner.',
  howHelp: 'Posso supportare chiunque abbia bisogno di tutela legale per la propria attività.',
  powerTeam: [{ name: 'Giulia Rossi', profession: 'Commercialista', reason: 'Complementarietà su M&A e startup' }],
  personalInfo: 'Padre di 2 figli. Appassionato di tennis e tecnologia applicata al diritto.',
};

async function seedMarcoWizard(lucaId?: string) {
  const { data: users } = await supabase.auth.admin.listUsers();
  const marco = users?.users.find(x => x.email === 'marco@ndp.it');
  if (!marco) return;

  const completion = 86; // Marco ha un profilo quasi completo
  await supabase.from('wizard_profiles').upsert({
    user_id: marco.id,
    profile_data: marcoProfile,
    completion_pct: completion,
    updated_at: new Date().toISOString(),
  });
  console.log(`  ✓ Wizard Marco seeded (${completion}%)`);
}

// ─── Professionals from lib/data.ts ────────────────────────
const professionals = [
  { id: 'demo-marco', name: 'Marco Mastella', profession: 'Avvocato Civile & Societario', category: 'Avvocato', city: 'Milano', chapter: 'NDP Milano Duomo', specialties: ['diritto civile','contratti','M&A','startup'], years_in_bni: 4, referrals_given: 124, rating: 4.8, month_score: 72, profile_score: 68, requests_received: 18, requests_fulfilled: 14, avg_response_time: 1.2, is_top_of_month: false, profile_complete: false, open_requests: 2 },
  { id: 'mi-001', name: 'Marco Ferretti', profession: 'Avvocato Civilista', category: 'Avvocato', city: 'Milano', chapter: 'NDP Milano Duomo', specialties: ['diritto civile','PMI','fusioni'], years_in_bni: 7, referrals_given: 214, rating: 4.9, month_score: 90, profile_score: 95, requests_received: 34, requests_fulfilled: 32, avg_response_time: 0.8, is_top_of_month: true, profile_complete: true, open_requests: 0 },
  { id: 'mi-002', name: 'Giulia Rossi', profession: 'Commercialista & Revisore', category: 'Commercialista', city: 'Milano', chapter: 'NDP Milano Brera', specialties: ['fiscale','bilanci','startup'], years_in_bni: 5, referrals_given: 187, rating: 4.9, month_score: 88, profile_score: 90, requests_received: 29, requests_fulfilled: 27, avg_response_time: 1.5, is_top_of_month: false, profile_complete: true, open_requests: 1 },
  { id: 'mi-003', name: 'Luca Bianchi', profession: 'Agente Immobiliare Senior', category: 'Agente Immobiliare', city: 'Milano', chapter: 'NDP Milano Navigli', specialties: ['residenziale','commerciale','luxury'], years_in_bni: 3, referrals_given: 98, rating: 4.7, month_score: 65, profile_score: 72, requests_received: 22, requests_fulfilled: 18, avg_response_time: 2.1, is_top_of_month: false, profile_complete: false, open_requests: 3 },
  { id: 'mi-004', name: 'Sofia Colombo', profession: 'Consulente Assicurativo', category: 'Assicuratore', city: 'Milano', chapter: 'NDP Milano Duomo', specialties: ['vita','aziende','RC professionale'], years_in_bni: 6, referrals_given: 156, rating: 4.8, month_score: 79, profile_score: 85, requests_received: 26, requests_fulfilled: 23, avg_response_time: 1.8, is_top_of_month: false, profile_complete: true, open_requests: 1 },
  { id: 'mi-005', name: 'Alessandro Galli', profession: 'Consulente IT & Cybersecurity', category: 'Consulente IT', city: 'Milano', chapter: 'NDP Milano Nord', specialties: ['cybersecurity','cloud','ERP'], years_in_bni: 2, referrals_given: 67, rating: 4.6, month_score: 58, profile_score: 60, requests_received: 15, requests_fulfilled: 12, avg_response_time: 3.2, is_top_of_month: false, profile_complete: false, open_requests: 2 },
  { id: 'rm-001', name: 'Chiara Marino', profession: 'Avvocato Penalista', category: 'Avvocato', city: 'Roma', chapter: 'NDP Roma Prati', specialties: ['penale','societario','arbitrato'], years_in_bni: 8, referrals_given: 243, rating: 4.9, month_score: 92, profile_score: 98, requests_received: 38, requests_fulfilled: 37, avg_response_time: 0.5, is_top_of_month: true, profile_complete: true, open_requests: 0 },
  { id: 'rm-002', name: 'Giorgio Conti', profession: 'Commercialista Tributarista', category: 'Commercialista', city: 'Roma', chapter: 'NDP Roma Parioli', specialties: ['tributario','IVA','transfer pricing'], years_in_bni: 4, referrals_given: 134, rating: 4.7, month_score: 71, profile_score: 78, requests_received: 21, requests_fulfilled: 19, avg_response_time: 2.4, is_top_of_month: false, profile_complete: true, open_requests: 1 },
  { id: 'to-001', name: 'Martina Ricci', profession: 'Architetto & Designer', category: 'Architetto', city: 'Torino', chapter: 'NDP Torino Centro', specialties: ['residenziale','commerciale','sostenibilità'], years_in_bni: 3, referrals_given: 89, rating: 4.8, month_score: 74, profile_score: 82, requests_received: 17, requests_fulfilled: 15, avg_response_time: 1.9, is_top_of_month: false, profile_complete: true, open_requests: 2 },
  { id: 'fi-001', name: 'Roberto Esposito', profession: 'Consulente Finanziario', category: 'Consulente Finanziario', city: 'Firenze', chapter: 'NDP Firenze', specialties: ['wealth management','fondi','previdenza'], years_in_bni: 5, referrals_given: 178, rating: 4.8, month_score: 83, profile_score: 88, requests_received: 28, requests_fulfilled: 25, avg_response_time: 1.3, is_top_of_month: false, profile_complete: true, open_requests: 1 },
  { id: 'bo-001', name: 'Elena Vitale', profession: 'Marketing & Digital Strategy', category: 'Marketing', city: 'Bologna', chapter: 'NDP Bologna', specialties: ['digital marketing','SEO','social media'], years_in_bni: 2, referrals_given: 54, rating: 4.7, month_score: 62, profile_score: 70, requests_received: 13, requests_fulfilled: 10, avg_response_time: 2.8, is_top_of_month: false, profile_complete: false, open_requests: 3 },
  { id: 'na-001', name: 'Antonio De Luca', profession: 'Ingegnere Strutturale', category: 'Ingegnere', city: 'Napoli', chapter: 'NDP Napoli', specialties: ['strutturale','antisismica','industriale'], years_in_bni: 6, referrals_given: 167, rating: 4.7, month_score: 76, profile_score: 80, requests_received: 24, requests_fulfilled: 21, avg_response_time: 2.0, is_top_of_month: false, profile_complete: true, open_requests: 1 },
];

async function seedProfessionals() {
  console.log('\n── Seed professionisti ────────────────────────────');
  const rows = professionals.map(p => ({
    id: p.id,
    name: p.name,
    profession: p.profession,
    category: p.category,
    city: p.city,
    chapter: p.chapter || null,
    specialties: p.specialties,
    years_in_bni: p.years_in_bni,
    referrals_given: p.referrals_given,
    rating: p.rating,
    month_score: p.month_score,
    profile_score: p.profile_score,
    requests_received: p.requests_received,
    requests_fulfilled: p.requests_fulfilled,
    avg_response_time: p.avg_response_time,
    is_top_of_month: p.is_top_of_month,
    profile_complete: p.profile_complete,
    open_requests: p.open_requests,
  }));

  const { error } = await supabase.from('professionals').upsert(rows);
  if (error) console.error('  ✗ Error seeding professionals:', error.message);
  else console.log(`  ✓ ${rows.length} professionisti inseriti/aggiornati`);
}

async function seedMarcoConversations() {
  console.log('\n── Seed conversazioni Marco ───────────────────────');
  const { data: users } = await supabase.auth.admin.listUsers();
  const marco = users?.users.find(x => x.email === 'marco@ndp.it');
  if (!marco) { console.log('  ✗ Marco non trovato'); return; }

  // Check if conversations already exist
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('initiator_id', marco.id);

  if (existing && existing.length > 0) {
    console.log(`  ✓ Conversazioni già esistenti (${existing.length})`);
    return;
  }

  const convs = [
    {
      initiator_id: marco.id,
      professional_id: 'mi-002',
      subject: 'Consulenza fiscale per M&A',
      status: 'active' as const,
      last_message_preview: 'Perfetto, ci vediamo giovedì allora.',
      unread_count: 2,
    },
    {
      initiator_id: marco.id,
      professional_id: 'mi-004',
      subject: 'Copertura RC Professionale Studio',
      status: 'active' as const,
      last_message_preview: 'Ho preparato il preventivo personalizzato.',
      unread_count: 0,
    },
    {
      initiator_id: marco.id,
      professional_id: 'fi-001',
      subject: 'Piano finanziario per espansione',
      status: 'resolved' as const,
      last_message_preview: 'Ottima collaborazione, grazie Marco!',
      unread_count: 0,
    },
  ];

  for (const conv of convs) {
    const { data: newConv } = await supabase.from('conversations').insert(conv).select().single();
    if (!newConv) continue;
    console.log(`  ✓ Conversazione con ${conv.professional_id} creata`);

    // Add initial messages
    await supabase.from('messages').insert([
      {
        conversation_id: newConv.id,
        sender_id: marco.id,
        sender_name: 'Marco Mastella',
        content: `Ciao! Ti contatto tramite NDP Reference. Avrei bisogno di un consulto riguardo a: ${conv.subject}. Quando saresti disponibile?`,
        type: 'text' as const,
        status: 'read' as const,
      },
      {
        conversation_id: newConv.id,
        sender_id: null,
        sender_name: conv.professional_id === 'mi-002' ? 'Giulia Rossi' : conv.professional_id === 'mi-004' ? 'Sofia Colombo' : 'Roberto Esposito',
        content: conv.last_message_preview,
        type: 'text' as const,
        status: 'delivered' as const,
      },
    ]);
  }

  // Seed one reference for Marco
  const { data: firstConv } = await supabase
    .from('conversations')
    .select('id')
    .eq('initiator_id', marco.id)
    .eq('professional_id', 'mi-002')
    .single();

  if (firstConv) {
    await supabase.from('references').insert({
      conversation_id: firstConv.id,
      from_user_id: marco.id,
      from_user_name: 'Marco Mastella',
      to_professional_id: 'mi-002',
      to_professional_name: 'Giulia Rossi',
      contact_name: 'Francesco Baldi',
      contact_type: 'referenza' as const,
      contact_info: 'f.baldi@techinnovation.it',
      notes: 'Ha bisogno di una revisione contabile completa per un round di investimento Series A.',
      urgency: 'alta' as const,
      has_consent: true,
      status: 'in_verifica' as const,
      score_awarded: 10,
    });
    console.log('  ✓ Referenza di Marco seeded');
  }

  // Seed activity logs for Marco
  await supabase.from('activity_logs').insert([
    { user_id: marco.id, user_display_name: 'Marco Mastella', type: 'user_registered', description: 'Account creato e accesso alla piattaforma' },
    { user_id: marco.id, user_display_name: 'Marco Mastella', type: 'profile_updated', description: 'Profilo AI completato al 86%' },
    { user_id: marco.id, user_display_name: 'Marco Mastella', type: 'chat_started', description: 'Conversazione aperta con Giulia Rossi' },
    { user_id: marco.id, user_display_name: 'Marco Mastella', type: 'chat_started', description: 'Conversazione aperta con Sofia Colombo' },
    { user_id: marco.id, user_display_name: 'Marco Mastella', type: 'reference_created', description: 'Referenza inviata a Giulia Rossi per Francesco Baldi (+10 punti)' },
  ]);
  console.log('  ✓ Log attività Marco seeded');
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║     NDP Reference — Supabase Setup Script       ║');
  console.log('╚══════════════════════════════════════════════════╝');

  await createDemoUsers();
  await seedProfessionals();
  await seedMarcoWizard();
  await seedMarcoConversations();

  console.log('\n✅ Setup completato!');
  console.log('\nCredenziali demo:');
  console.log('  Professionista: marco@ndp.it / demo1234');
  console.log('  Responsabile:   luca@ndp.it  / demo1234');
}

main().catch(console.error);
