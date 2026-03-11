/**
 * NDP Reference — Setup Script
 * Inserisce professionisti in Supabase
 *
 * Uso: npx tsx scripts/setup-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sgnykkrtckrfbcltwsrt.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnbnlra3J0Y2tyZmJjbHR3c3J0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc5MDY2OSwiZXhwIjoyMDg4MzY2NjY5fQ.GrNBnT0GFlcs3nPsLzkQahhenRm2bFGL9lejgH-GoPE';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ─── Professionals ──────────────────────────────────────────
const professionals = [
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

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║     NDP Reference — Supabase Setup Script       ║');
  console.log('╚══════════════════════════════════════════════════╝');

  await seedProfessionals();

  console.log('\n✅ Setup completato!');
}

main().catch(console.error);
