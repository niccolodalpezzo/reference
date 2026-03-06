import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export type Ref = Database['public']['Tables']['references']['Row'];
type RefInsert = Database['public']['Tables']['references']['Insert'];

export async function getReferencesByConversation(conversationId: string): Promise<Ref[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('references')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false });
  return (data ?? []) as Ref[];
}

export async function getReferencesByUser(userId: string): Promise<Ref[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('references')
    .select('*')
    .eq('from_user_id', userId)
    .order('created_at', { ascending: false });
  return (data ?? []) as Ref[];
}

export async function getPendingReferences(): Promise<Ref[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('references')
    .select('*')
    .eq('status', 'in_verifica')
    .order('created_at', { ascending: false });
  return (data ?? []) as Ref[];
}

export async function createReference(payload: Omit<RefInsert, 'id' | 'created_at' | 'status' | 'score_awarded'>): Promise<Ref | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('references')
    .insert({ ...payload, status: 'in_verifica', score_awarded: 10 } as RefInsert)
    .select()
    .single();
  return data as Ref | null;
}

export async function approveReference(id: string, reviewedByUserId: string, reviewNotes?: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('references').update({
    status: 'approvata',
    reviewed_by_user_id: reviewedByUserId,
    review_notes: reviewNotes,
    reviewed_at: new Date().toISOString(),
    score_awarded: 40,
  } as Database['public']['Tables']['references']['Update']).eq('id', id);
}

export async function rejectReference(id: string, reviewedByUserId: string, reviewNotes: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('references').update({
    status: 'rifiutata',
    reviewed_by_user_id: reviewedByUserId,
    review_notes: reviewNotes,
    reviewed_at: new Date().toISOString(),
    score_awarded: 0,
  } as Database['public']['Tables']['references']['Update']).eq('id', id);
}
