import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export type Award = Database['public']['Tables']['awards']['Row'];
type AwardInsert = Database['public']['Tables']['awards']['Insert'];

export async function getAwardsForMember(memberId: string): Promise<Award[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('awards')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false });
  return (data ?? []) as Award[];
}

export async function getAwardsByZoneManager(managerId: string): Promise<Award[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('awards')
    .select('*')
    .eq('awarded_by_id', managerId)
    .order('created_at', { ascending: false });
  return (data ?? []) as Award[];
}

export async function createAward(payload: {
  member_id: string;
  member_name: string;
  awarded_by_id: string;
  awarded_by_name: string;
  title: string;
  description?: string;
  score_bonus?: number;
}): Promise<Award | null> {
  const supabase = createClient();
  const { data } = await supabase.from('awards').insert(payload as AwardInsert).select().single();
  return data as Award | null;
}
