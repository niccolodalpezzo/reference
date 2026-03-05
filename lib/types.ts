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
  yearsInBNI: number;
  referralsGiven: number;
  rating: number;
  // Metriche per ranking e area resp-zona
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

export interface Chapter {
  id: string;
  name: string;
  city: string;
  meetingDay: string;
  meetingTime: string;
  memberCount: number;
  topCategories: string[];
  founded: number;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  matchedIds?: string[];
  timestamp: Date;
}

export interface WizardProfile {
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
