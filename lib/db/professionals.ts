import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export type ProfessionalRow = Database['public']['Tables']['professionals']['Row'];

export async function getAllProfessionals(): Promise<ProfessionalRow[]> {
  const supabase = createClient();
  const { data } = await supabase.from('professionals').select('*').order('name');
  return (data ?? []) as ProfessionalRow[];
}

export async function getProfessionalById(id: string): Promise<ProfessionalRow | null> {
  const supabase = createClient();
  const { data } = await supabase.from('professionals').select('*').eq('id', id).single();
  return data as ProfessionalRow | null;
}

export async function searchProfessionals(params: {
  query?: string;
  category?: string;
  city?: string;
}): Promise<ProfessionalRow[]> {
  const supabase = createClient();
  let q = supabase.from('professionals').select('*') as ReturnType<typeof supabase.from>;
  if (params.category && params.category !== 'Tutte') q = (q as ReturnType<typeof supabase.from>).eq('category', params.category);
  if (params.city && params.city !== 'Tutte') q = (q as ReturnType<typeof supabase.from>).ilike('city', params.city);
  if (params.query) q = (q as ReturnType<typeof supabase.from>).ilike('name', `%${params.query}%`);
  const { data } = await (q as ReturnType<typeof supabase.from>).order('month_score', { ascending: false }).limit(48);
  return (data ?? []) as ProfessionalRow[];
}

export interface ProfessionalWithUserId extends ProfessionalRow {
  /** UUID from user_profiles — use this for alert/award/log operations */
  user_profile_id: string;
}

export async function getMembersByZoneManager(managerId: string): Promise<ProfessionalWithUserId[]> {
  const supabase = createClient();
  // Fetch user_profiles that belong to this zone manager, including both
  // the user UUID (id) and the linked professional text-id (professional_id)
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('id, professional_id')
    .eq('zone_manager_id', managerId)
    .not('professional_id', 'is', null);
  if (!profiles?.length) return [];

  // Map: professionals.id (TEXT) → user_profiles.id (UUID)
  const profileMap = new Map(
    (profiles as { id: string; professional_id: string }[]).map((p) => [p.professional_id, p.id])
  );
  const professionalIds = Array.from(profileMap.keys());

  const { data } = await supabase
    .from('professionals')
    .select('*')
    .in('id', professionalIds)
    .order('name');

  return ((data ?? []) as ProfessionalRow[]).map((p) => ({
    ...p,
    user_profile_id: profileMap.get(p.id) ?? p.id,
  }));
}

export async function getTopProfessionals(limit = 6): Promise<ProfessionalRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('professionals')
    .select('*')
    .order('month_score', { ascending: false })
    .limit(limit);
  return (data ?? []) as ProfessionalRow[];
}
