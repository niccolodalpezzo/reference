export type ProfessionCategory =
  | 'Avvocato'
  | 'Commercialista'
  | 'Agente Immobiliare'
  | 'Assicuratore'
  | 'Consulente IT'
  | 'Marketing'
  | 'Architetto'
  | 'Dentista'
  | 'Consulente Finanziario'
  | 'Notaio'
  | 'Ingegnere'
  | 'Medico'
  | 'Fotografo'
  | 'Coach'
  | 'Traduttore';

export type UserRole = 'guest' | 'member' | 'zone_manager';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  professionalId?: string;
  password?: string;
  city?: string;
  zone?: string;
  zoneManagerId?: string;
  registeredAt?: string;
}

export interface Professional {
  id: string;
  name: string;
  profession: string;
  category: ProfessionCategory;
  city: string;
  chapter: string;
  phone: string;
  email: string;
  bio: string;
  specialties: string[];
  yearsInNDP: number;
  referralsGiven: number;
  rating: number;
  monthScore?: number;
  profileScore?: number;
  activityScore?: number;
  requestsReceived?: number;
  requestsFulfilled?: number;
  avgResponseTime?: number;
  isTopOfMonth?: boolean;
  profileComplete?: boolean;
  lastUpdate?: string;
  openRequests?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  matchedIds?: string[];
  timestamp: Date;
}

export interface WizardProfile {
  firstName: string;
  lastName: string;
  photoUrl: string;
  businessName: string;
  yearsExperience: number;
  cities: string[];
  sectors: string[];
  mainServices: string[];
  typicalCases: string;
  triggerPhrases: string[];
  goals: string;
  achievements: string;
  interests: string;
  networks: string;
  skills: string;
  idealClientProfile: string;
  topClients: Array<{ sector: string; area: string; work: string }>;
  goodReference: string;
  badReference: string;
  otherSources: string;
  howHelp: string;
  powerTeam: string[];
  personalInfo: string;
}

// ─── CHAT / MESSAGGI ────────────────────────────────────────────────────────

export type ConversationStatus = 'active' | 'archived' | 'resolved' | 'muted';

export interface Conversation {
  id: string;
  participants: string[];       // [userId, professionalId]
  professionalId: string;
  initiatorId: string;
  subject?: string;
  status: ConversationStatus;
  unreadCount: number;
  lastMessageAt: string;
  lastMessagePreview: string;
  createdAt: string;
}

export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MessageType = 'text' | 'attachment' | 'reference_card' | 'system';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  attachmentName?: string;
  attachmentSize?: string;
  referenceId?: string;
  timestamp: string;
}

// ─── DAI REFERENCE ──────────────────────────────────────────────────────────

export type ReferenceStatus = 'inviata' | 'in_verifica' | 'approvata' | 'rifiutata';
export type ContactType = 'lead' | 'referenza' | 'opportunità';
export type UrgencyLevel = 'bassa' | 'media' | 'alta';

export interface Reference {
  id: string;
  conversationId: string;
  fromUserId: string;
  fromUserName: string;
  toProfessionalId: string;
  toProfessionalName: string;
  contactName: string;
  contactType: ContactType;
  contactInfo: string;
  notes: string;
  urgency: UrgencyLevel;
  estimatedValue?: number;
  hasConsent: boolean;
  status: ReferenceStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedByUserId?: string;
  reviewNotes?: string;
  scoreAwarded?: number;
}

// ─── ACTIVITY LOG ────────────────────────────────────────────────────────────

export type ActivityLogType =
  | 'request_sent'
  | 'chat_started'
  | 'first_response'
  | 'attachment_sent'
  | 'reference_created'
  | 'reference_approved'
  | 'reference_rejected'
  | 'profile_updated'
  | 'profile_completed'
  | 'conversation_resolved'
  | 'top_performer_marked'
  | 'alert_created'
  | 'alert_closed'
  | 'user_registered';

export interface ActivityLog {
  id: string;
  userId: string;
  userDisplayName: string;
  type: ActivityLogType;
  description: string;
  metadata?: Record<string, string | number | boolean>;
  timestamp: string;
}

// ─── ALERT ──────────────────────────────────────────────────────────────────

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'open' | 'closed' | 'archived';

export interface Alert {
  id: string;
  memberId: string;
  memberName: string;
  createdByUserId: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
  closedAt?: string;
  closedNotes?: string;
}

// ─── SCORING ─────────────────────────────────────────────────────────────────

export interface AfidabilityScore {
  professionalId: string;
  total: number;        // 0–1000
  affidabilita: number; // 0–300
  riferenze: number;    // 0–400
  attivita: number;     // 0–200
  profilo: number;      // 0–100
  trend: 'up' | 'down' | 'stable';
  trendReason: string;
  computedAt: string;
}

// ─── REGISTRATION ────────────────────────────────────────────────────────────

export interface RegistrationPayload {
  nome: string;
  cognome: string;
  email: string;
  password: string;
  city: string;
  professione: string;
  categoria: ProfessionCategory;
}
