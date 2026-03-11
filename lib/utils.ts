import { Professional, ProfessionCategory } from './types';
import { professionals } from './data';

export function filterProfessionals(
  category?: string,
  city?: string,
  query?: string
): Professional[] {
  return professionals.filter((p) => {
    if (category && category !== 'Tutte' && p.category !== category) return false;
    if (city && city !== 'Tutte' && p.city !== city) return false;
    if (query) {
      const q = query.toLowerCase();
      const searchable = [p.name, p.profession, p.bio, ...p.specialties].join(' ').toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });
}

export function getProfessionalById(id: string): Professional | undefined {
  return professionals.find((p) => p.id === id);
}

export function getProfessionalsByIds(ids: string[]): Professional[] {
  return ids.map((id) => getProfessionalById(id)).filter(Boolean) as Professional[];
}

export function getUniqueCities(): string[] {
  return ['Tutte', ...Array.from(new Set(professionals.map((p) => p.city))).sort()];
}

export function getUniqueCategories(): string[] {
  return ['Tutte', ...Array.from(new Set(professionals.map((p) => p.category))).sort()];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function formatReferrals(n: number): string {
  return n > 200 ? `${n}+ referral` : `${n} referral`;
}

export function getTopProfessionisti(limit = 8): Professional[] {
  return [...professionals]
    .filter((p) => p.monthScore !== undefined)
    .sort((a, b) => (b.monthScore ?? 0) - (a.monthScore ?? 0))
    .slice(0, limit);
}

export function getAlertMembers(): Professional[] {
  return professionals.filter((p) => (p.openRequests ?? 0) > 0);
}

export function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
