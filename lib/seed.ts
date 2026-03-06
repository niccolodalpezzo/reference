import { Conversation, Message, Reference, ActivityLog, Alert, DemoUser } from '@/lib/types';
import { seedUsers } from '@/lib/storage/users';
import { seedLogs } from '@/lib/storage/logs';
import { seedAlerts } from '@/lib/storage/alerts';

const SEED_FLAG = 'ndp-seed-v1';

function isSeeded(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(SEED_FLAG) === 'true';
}

function markSeeded(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SEED_FLAG, 'true');
}

function seedConversations(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem('ndp-conversations-v1')) return;
  const convs: Conversation[] = [
    {
      id: 'conv-001',
      participants: ['u1', 'mi-001'],
      professionalId: 'mi-001',
      initiatorId: 'u1',
      subject: 'Consulenza contratto di distribuzione',
      status: 'active',
      unreadCount: 2,
      lastMessageAt: '2026-03-04T16:30:00Z',
      lastMessagePreview: 'Ho letto il contratto e ho alcune osservazioni...',
      createdAt: '2026-03-01T09:00:00Z',
    },
    {
      id: 'conv-002',
      participants: ['u1', 'mi-002'],
      professionalId: 'mi-002',
      initiatorId: 'u1',
      subject: 'Pianificazione fiscale 2026',
      status: 'resolved',
      unreadCount: 0,
      lastMessageAt: '2026-02-28T11:00:00Z',
      lastMessagePreview: 'Perfetto, ci sentiamo la settimana prossima.',
      createdAt: '2026-02-20T10:00:00Z',
    },
    {
      id: 'conv-003',
      participants: ['u1', 'mi-004'],
      professionalId: 'mi-004',
      initiatorId: 'u1',
      subject: 'RC Professionale Studio Legale',
      status: 'active',
      unreadCount: 0,
      lastMessageAt: '2026-03-03T14:00:00Z',
      lastMessagePreview: 'Le mando il preventivo entro domani.',
      createdAt: '2026-03-02T09:30:00Z',
    },
  ];
  localStorage.setItem('ndp-conversations-v1', JSON.stringify(convs));
}

function seedMessages(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem('ndp-messages-v1')) return;
  const msgs: Message[] = [
    // conv-001: Marco ↔ Marco Ferretti (avvocato)
    {
      id: 'msg-001-1',
      conversationId: 'conv-001',
      senderId: 'u1',
      senderName: 'Marco Mastella',
      content: 'Buongiorno, ho trovato il tuo profilo su NDP Reference e mi servirebbe una consulenza su un contratto di distribuzione internazionale.',
      type: 'text',
      status: 'read',
      timestamp: '2026-03-01T09:00:00Z',
    },
    {
      id: 'msg-001-2',
      conversationId: 'conv-001',
      senderId: 'mi-001',
      senderName: 'Marco Ferretti',
      content: 'Buongiorno Marco, grazie per avermi contattato. Sono specializzato in contratti internazionali da 15 anni. Può inviarmi una bozza del contratto?',
      type: 'text',
      status: 'read',
      timestamp: '2026-03-01T10:30:00Z',
    },
    {
      id: 'msg-001-3',
      conversationId: 'conv-001',
      senderId: 'u1',
      senderName: 'Marco Mastella',
      content: 'Certo, le allego il documento.',
      type: 'attachment',
      status: 'read',
      attachmentName: 'contratto_distribuzione_v2.pdf',
      attachmentSize: '1.2 MB',
      timestamp: '2026-03-02T08:00:00Z',
    },
    {
      id: 'msg-001-4',
      conversationId: 'conv-001',
      senderId: 'mi-001',
      senderName: 'Marco Ferretti',
      content: 'Ho ricevuto il documento. Lo esamino entro 48 ore e le mando un feedback dettagliato.',
      type: 'text',
      status: 'read',
      timestamp: '2026-03-02T09:15:00Z',
    },
    {
      id: 'msg-001-ref',
      conversationId: 'conv-001',
      senderId: 'u1',
      senderName: 'Marco Mastella',
      content: 'Ho una referenza per lei: un collega che cerca un avvocato per contratti EU.',
      type: 'reference_card',
      status: 'read',
      referenceId: 'ref-001',
      timestamp: '2026-03-02T10:00:00Z',
    },
    {
      id: 'msg-001-5',
      conversationId: 'conv-001',
      senderId: 'mi-001',
      senderName: 'Marco Ferretti',
      content: 'Ho letto il contratto e ho alcune osservazioni da condividere. Possiamo fissare una call?',
      type: 'text',
      status: 'delivered',
      timestamp: '2026-03-04T16:30:00Z',
    },
    {
      id: 'msg-001-6',
      conversationId: 'conv-001',
      senderId: 'mi-001',
      senderName: 'Marco Ferretti',
      content: 'Le propongo giovedì alle 10:30 o venerdì alle 15:00.',
      type: 'text',
      status: 'sent',
      timestamp: '2026-03-04T16:31:00Z',
    },
    // conv-002: Marco ↔ Commercialista (resolved)
    {
      id: 'msg-002-1',
      conversationId: 'conv-002',
      senderId: 'u1',
      senderName: 'Marco Mastella',
      content: 'Salve, vorrei pianificare la situazione fiscale del 2026 per il mio studio. Ha disponibilità?',
      type: 'text',
      status: 'read',
      timestamp: '2026-02-20T10:00:00Z',
    },
    {
      id: 'msg-002-2',
      conversationId: 'conv-002',
      senderId: 'mi-002',
      senderName: 'Elena Ricci',
      content: 'Certamente! Ho esperienza con studi legali. Fissiamo un appuntamento conoscitivo gratuito di 30 minuti?',
      type: 'text',
      status: 'read',
      timestamp: '2026-02-20T11:00:00Z',
    },
    {
      id: 'msg-002-3',
      conversationId: 'conv-002',
      senderId: 'u1',
      senderName: 'Marco Mastella',
      content: 'Ottimo, mercoledì 26 febbraio alle 14:00 va bene per lei?',
      type: 'text',
      status: 'read',
      timestamp: '2026-02-21T09:00:00Z',
    },
    {
      id: 'msg-002-4',
      conversationId: 'conv-002',
      senderId: 'mi-002',
      senderName: 'Elena Ricci',
      content: 'Perfetto, confermato. Le mando un calendario invite.',
      type: 'text',
      status: 'read',
      timestamp: '2026-02-21T09:30:00Z',
    },
    {
      id: 'msg-002-5',
      conversationId: 'conv-002',
      senderId: 'u1',
      senderName: 'Marco Mastella',
      content: 'La chiamata è stata molto utile. Procediamo pure con la proposta.',
      type: 'text',
      status: 'read',
      timestamp: '2026-02-26T15:00:00Z',
    },
    {
      id: 'msg-002-6',
      conversationId: 'conv-002',
      senderId: 'mi-002',
      senderName: 'Elena Ricci',
      content: 'Perfetto, ci sentiamo la settimana prossima.',
      type: 'text',
      status: 'read',
      timestamp: '2026-02-28T11:00:00Z',
    },
    // conv-003: Marco ↔ Assicuratore
    {
      id: 'msg-003-1',
      conversationId: 'conv-003',
      senderId: 'u1',
      senderName: 'Marco Mastella',
      content: 'Buongiorno, il mio studio legale sta cercando una RC professionale adeguata. Può aiutarmi?',
      type: 'text',
      status: 'read',
      timestamp: '2026-03-02T09:30:00Z',
    },
    {
      id: 'msg-003-2',
      conversationId: 'conv-003',
      senderId: 'mi-004',
      senderName: 'Roberto Cattaneo',
      content: 'Buongiorno! Specializzato in RC per studi legali da 8 anni. Quanti avvocati ha nel suo studio?',
      type: 'text',
      status: 'read',
      timestamp: '2026-03-02T10:00:00Z',
    },
    {
      id: 'msg-003-ref',
      conversationId: 'conv-003',
      senderId: 'u1',
      senderName: 'Marco Mastella',
      content: 'Ho un collega che potrebbe essere interessato alla sua polizza.',
      type: 'reference_card',
      status: 'read',
      referenceId: 'ref-002',
      timestamp: '2026-03-02T11:00:00Z',
    },
    {
      id: 'msg-003-3',
      conversationId: 'conv-003',
      senderId: 'mi-004',
      senderName: 'Roberto Cattaneo',
      content: 'Le mando il preventivo entro domani.',
      type: 'text',
      status: 'read',
      timestamp: '2026-03-03T14:00:00Z',
    },
  ];
  localStorage.setItem('ndp-messages-v1', JSON.stringify(msgs));
}

function seedReferences(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem('ndp-references-v1')) return;
  const refs: Reference[] = [
    {
      id: 'ref-001',
      conversationId: 'conv-001',
      fromUserId: 'u1',
      fromUserName: 'Marco Mastella',
      toProfessionalId: 'mi-001',
      toProfessionalName: 'Marco Ferretti',
      contactName: 'Ing. Giuseppe Bianchi',
      contactType: 'lead',
      contactInfo: 'g.bianchi@techcorp.it',
      notes: 'Cerca un avvocato per contratto di distribuzione EU. Budget stimato 8–12K€.',
      urgency: 'alta',
      estimatedValue: 8000,
      hasConsent: true,
      status: 'in_verifica',
      createdAt: '2026-03-02T10:00:00Z',
    },
    {
      id: 'ref-002',
      conversationId: 'conv-003',
      fromUserId: 'u1',
      fromUserName: 'Marco Mastella',
      toProfessionalId: 'mi-004',
      toProfessionalName: 'Roberto Cattaneo',
      contactName: 'Avv. Paolo Verdi',
      contactType: 'referenza',
      contactInfo: '+39 335 111 2222',
      notes: 'Studio legale di 4 avvocati, cerca RC professionale. Pronto ad acquistare.',
      urgency: 'media',
      estimatedValue: 3200,
      hasConsent: true,
      status: 'approvata',
      createdAt: '2026-02-25T09:00:00Z',
      reviewedAt: '2026-02-26T11:00:00Z',
      reviewedByUserId: 'u2',
      reviewNotes: 'Referenza qualificata e verificata. Approvata.',
      scoreAwarded: 40,
    },
  ];
  localStorage.setItem('ndp-references-v1', JSON.stringify(refs));
}

function seedActivityLogs(): void {
  const logs: ActivityLog[] = [
    {
      id: 'log-001',
      userId: 'u1',
      userDisplayName: 'Marco Mastella',
      type: 'user_registered',
      description: 'Account registrato sulla piattaforma NDP Reference',
      timestamp: '2025-09-01T08:00:00Z',
    },
    {
      id: 'log-002',
      userId: 'u1',
      userDisplayName: 'Marco Mastella',
      type: 'profile_updated',
      description: 'Profilo aggiornato: Sezione Identità completata',
      timestamp: '2025-09-02T10:00:00Z',
    },
    {
      id: 'log-003',
      userId: 'u1',
      userDisplayName: 'Marco Mastella',
      type: 'profile_updated',
      description: 'Profilo aggiornato: Sezione GAINS completata',
      timestamp: '2025-09-05T14:00:00Z',
    },
    {
      id: 'log-004',
      userId: 'u1',
      userDisplayName: 'Marco Mastella',
      type: 'chat_started',
      description: 'Conversazione avviata con Marco Ferretti (Avvocato)',
      metadata: { conversationId: 'conv-001', professionalId: 'mi-001' },
      timestamp: '2026-03-01T09:00:00Z',
    },
    {
      id: 'log-005',
      userId: 'u1',
      userDisplayName: 'Marco Mastella',
      type: 'chat_started',
      description: 'Conversazione avviata con Elena Ricci (Commercialista)',
      metadata: { conversationId: 'conv-002', professionalId: 'mi-002' },
      timestamp: '2026-02-20T10:00:00Z',
    },
    {
      id: 'log-006',
      userId: 'u1',
      userDisplayName: 'Marco Mastella',
      type: 'chat_started',
      description: 'Conversazione avviata con Roberto Cattaneo (Assicuratore)',
      metadata: { conversationId: 'conv-003', professionalId: 'mi-004' },
      timestamp: '2026-03-02T09:30:00Z',
    },
    {
      id: 'log-007',
      userId: 'u1',
      userDisplayName: 'Marco Mastella',
      type: 'reference_created',
      description: 'Referenza inviata a Marco Ferretti: Ing. Giuseppe Bianchi (lead, alta urgenza)',
      metadata: { referenceId: 'ref-001', value: 8000 },
      timestamp: '2026-03-02T10:00:00Z',
    },
    {
      id: 'log-008',
      userId: 'u1',
      userDisplayName: 'Marco Mastella',
      type: 'reference_created',
      description: 'Referenza inviata a Roberto Cattaneo: Avv. Paolo Verdi (referenza)',
      metadata: { referenceId: 'ref-002', value: 3200 },
      timestamp: '2026-02-25T09:00:00Z',
    },
    {
      id: 'log-009',
      userId: 'u1',
      userDisplayName: 'Marco Mastella',
      type: 'reference_approved',
      description: 'Referenza approvata: Avv. Paolo Verdi per Roberto Cattaneo (+40 punti)',
      metadata: { referenceId: 'ref-002', scoreAwarded: 40 },
      timestamp: '2026-02-26T11:00:00Z',
    },
    {
      id: 'log-010',
      userId: 'u1',
      userDisplayName: 'Marco Mastella',
      type: 'conversation_resolved',
      description: 'Conversazione con Elena Ricci risolta con successo',
      metadata: { conversationId: 'conv-002' },
      timestamp: '2026-02-28T12:00:00Z',
    },
  ];
  seedLogs(logs);
}

function seedAlertsData(): void {
  const alerts: Alert[] = [
    {
      id: 'alert-001',
      memberId: 'bo-003',
      memberName: 'Stefano Ruggi',
      createdByUserId: 'u2',
      title: '10 richieste aperte senza risposta',
      description: 'Membro inattivo da 80+ giorni. Profilo incompleto e nessuna risposta alle richieste ricevute. Necessita sollecito urgente.',
      severity: 'critical',
      status: 'open',
      createdAt: '2026-03-01T08:00:00Z',
    },
    {
      id: 'alert-002',
      memberId: 'to-004',
      memberName: 'Laura Benedetti',
      createdByUserId: 'u2',
      title: 'Profilo incompleto da 55 giorni',
      description: 'Profilo al 68% da oltre 55 giorni. Score basso, visibilità ridotta nel network. Si consiglia completamento sezione GAINS.',
      severity: 'warning',
      status: 'open',
      createdAt: '2026-02-28T08:00:00Z',
    },
  ];
  seedAlerts(alerts);
}

function seedUsersData(): void {
  const users: DemoUser[] = [
    {
      id: 'u1',
      name: 'Marco Mastella',
      email: 'marco@demo.it',
      role: 'member',
      professionalId: 'demo-marco',
      password: 'demo',
      city: 'Milano',
      zone: 'Zona Nord',
      zoneManagerId: 'u2',
      registeredAt: '2025-09-01T08:00:00Z',
    },
    {
      id: 'u2',
      name: 'Luca Ferrari',
      email: 'luca@demo.it',
      role: 'zone_manager',
      password: 'demo',
      city: 'Milano',
      zone: 'Zona Nord',
      registeredAt: '2025-09-01T08:00:00Z',
    },
  ];
  seedUsers(users);
}

export function initSeed(): void {
  if (isSeeded()) return;
  seedUsersData();
  seedConversations();
  seedMessages();
  seedReferences();
  seedActivityLogs();
  seedAlertsData();
  markSeeded();
}

export function resetSeed(): void {
  if (typeof window === 'undefined') return;
  const keysToRemove = [
    SEED_FLAG,
    'ndp-conversations-v1',
    'ndp-messages-v1',
    'ndp-references-v1',
    'ndp-logs-v1',
    'ndp-alerts-v1',
    'ndp-users-v1',
  ];
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}
