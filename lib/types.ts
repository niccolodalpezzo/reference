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
