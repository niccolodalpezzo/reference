import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export type Message = Database['public']['Tables']['messages']['Row'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];

export async function getMessages(conversationId: string): Promise<Message[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('sent_at', { ascending: true });
  return (data ?? []) as Message[];
}

export async function addMessage(payload: MessageInsert): Promise<Message | null> {
  const supabase = createClient();
  const { data: msg } = await supabase.from('messages').insert(payload as MessageInsert).select().single();
  const typedMsg = msg as Message | null;
  if (typedMsg) {
    await supabase.from('conversations').update({
      last_message_at: typedMsg.sent_at,
      last_message_preview: typedMsg.content.slice(0, 80),
      unread_count: 1,
    } as Database['public']['Tables']['conversations']['Update']).eq('id', payload.conversation_id);
  }
  return typedMsg;
}

export async function addSystemMessage(conversationId: string, content: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_name: 'Sistema',
    content,
    type: 'system',
  } as MessageInsert);
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('conversations').update({ unread_count: 0 } as Database['public']['Tables']['conversations']['Update']).eq('id', conversationId);
}
