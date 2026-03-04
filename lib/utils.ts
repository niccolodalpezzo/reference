import { Professional, Chapter, ProfessionCategory } from './types';
import { professionals, chapters } from './data';

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
