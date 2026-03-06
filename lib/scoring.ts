import { Professional, Reference, Conversation, AfidabilityScore, WizardProfile } from '@/lib/types';

export function computeScore(
  professional: Professional,
  references: Reference[],
  conversations: Conversation[]
): AfidabilityScore {
  // Affidabilità (0–300): based on avgResponseTime (hours)
  const rt = professional.avgResponseTime ?? 24;
  let affidabilita = 0;
  if (rt < 2) affidabilita = Math.round(280 + (2 - rt) * 10);
  else if (rt < 4) affidabilita = Math.round(200 + ((4 - rt) / 2) * 79);
  else if (rt < 24) affidabilita = Math.round(80 + ((24 - rt) / 20) * 119);
  else affidabilita = Math.max(0, Math.round(80 - (rt - 24) * 2));
  affidabilita = Math.min(300, Math.max(0, affidabilita));

  // Riferenze (0–400): action-based — +10 on creation (in_verifica), +30 bonus on approval (total 40)
  const myRefs = references.filter((r) => r.toProfessionalId === professional.id);
  const approved = myRefs.filter((r) => r.status === 'approvata');
  const inVerifica = myRefs.filter((r) => r.status === 'in_verifica');
  const riferenze = Math.min(400, inVerifica.length * 10 + approved.length * 40);

  // Attività (0–200)
  const resolved = conversations.filter(
    (c) => c.participants.includes(professional.id) && c.status === 'resolved'
  );
  const attivita = Math.min(
    200,
    resolved.length * 15 + (professional.requestsFulfilled ?? 0) * 5
  );

  // Profilo (0–100)
  const profilo = Math.min(100, professional.profileScore ?? 0);

  const total = affidabilita + riferenze + attivita + profilo;

  // Trend logic (simplified: based on recent approved refs and response time)
  let trend: 'up' | 'down' | 'stable' = 'stable';
  let trendReason = 'Nessuna variazione significativa questa settimana';

  if (approved.length > 0) {
    const recentApproval = approved.find((r) => {
      const days = (Date.now() - new Date(r.reviewedAt ?? r.createdAt).getTime()) / 86400000;
      return days <= 7;
    });
    if (recentApproval) {
      trend = 'up';
      trendReason = `${approved.length} referenz${approved.length === 1 ? 'a approvata' : 'e approvate'} — ottimo lavoro!`;
    }
  }

  if (rt < 4 && trend === 'stable') {
    trend = 'up';
    trendReason = `Rispondi in media in ${rt < 1 ? `${Math.round(rt * 60)}min` : `${rt}h`} — eccellente!`;
  }

  if (profilo < 60 && trend === 'stable') {
    trend = 'down';
    trendReason = `Profilo al ${profilo}% — completalo per guadagnare ${100 - profilo} punti`;
  }

  return {
    professionalId: professional.id,
    total,
    affidabilita,
    riferenze,
    attivita,
    profilo,
    trend,
    trendReason,
    computedAt: new Date().toISOString(),
  };
}

export function computeProfileCompletion(profile: WizardProfile): number {
  const sections = [
    !!(profile.firstName && profile.lastName && profile.businessName),
    profile.mainServices.length > 0,
    !!(profile.typicalCases && profile.triggerPhrases.length > 0),
    !!(profile.goals && profile.achievements),
    !!(profile.idealClientProfile && profile.topClients.length > 0),
    !!(profile.goodReference && profile.badReference),
    !!profile.personalInfo,
  ];
  const completed = sections.filter(Boolean).length;
  return Math.round((completed / sections.length) * 100);
}

export function getResponseSLA(hours: number): 'verde' | 'giallo' | 'rosso' {
  if (hours < 4) return 'verde';
  if (hours < 24) return 'giallo';
  return 'rosso';
}

export function formatResponseTime(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)} giorni`;
}
