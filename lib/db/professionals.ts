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

export async function getMembersByZoneManager(managerId: string): Promise<ProfessionalRow[]> {
  const supabase = createClient();
  // Get professional_ids linked to members of this zone manager
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('professional_id')
    .eq('zone_manager_id', managerId)
    .not('professional_id', 'is', null);
  if (!profiles?.length) return [];
  const professionalIds = (profiles as { professional_id: string }[]).map((p) => p.professional_id);
  const { data } = await supabase
    .from('professionals')
    .select('*')
    .in('id', professionalIds)
    .order('name');
  return (data ?? []) as ProfessionalRow[];
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
