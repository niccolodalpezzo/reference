import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export type Conversation = Database['public']['Tables']['conversations']['Row'];

export async function getConversations(userId: string): Promise<Conversation[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('conversations')
    .select('*')
    .eq('initiator_id', userId)
    .order('last_message_at', { ascending: false });
  return (data ?? []) as Conversation[];
}

export async function getConversationById(id: string): Promise<Conversation | null> {
  const supabase = createClient();
  const { data } = await supabase.from('conversations').select('*').eq('id', id).single();
  return data as Conversation | null;
}

export async function getOrCreateConversation(initiatorId: string, professionalId: string, subject?: string): Promise<Conversation | null> {
  const supabase = createClient();
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('initiator_id', initiatorId)
    .eq('professional_id', professionalId)
    .maybeSingle();
  if (existing) return existing as Conversation;
  const { data } = await supabase
    .from('conversations')
    .insert({ initiator_id: initiatorId, professional_id: professionalId, subject } as Database['public']['Tables']['conversations']['Insert'])
    .select()
    .single();
  return data as Conversation | null;
}

export async function updateConversation(id: string, partial: Partial<Conversation>): Promise<void> {
  const supabase = createClient();
  await supabase.from('conversations').update(partial as Database['public']['Tables']['conversations']['Update']).eq('id', id);
}

export async function getTotalUnread(userId: string): Promise<number> {
  const supabase = createClient();
  const { data } = await supabase
    .from('conversations')
    .select('unread_count')
    .eq('initiator_id', userId);
  return ((data ?? []) as { unread_count: number }[]).reduce((sum, c) => sum + (c.unread_count || 0), 0);
}
