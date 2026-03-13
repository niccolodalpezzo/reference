import { createClient } from '@/lib/supabase/client';
import type { Database, Json } from '@/lib/supabase/types';

export type ActivityLog = Database['public']['Tables']['activity_logs']['Row'];
type LogInsert = Database['public']['Tables']['activity_logs']['Insert'];

export async function getLogsForUser(userId: string, limit = 50): Promise<ActivityLog[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as ActivityLog[];
}

export async function getZoneLogs(managerId: string, limit = 30): Promise<ActivityLog[]> {
  const supabase = createClient();
  const { data: members } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('zone_manager_id', managerId);
  if (!members?.length) return [];
  const memberIds = (members as { id: string }[]).map(m => m.id);
  const { data } = await supabase
    .from('activity_logs')
    .select('*')
    .in('user_id', memberIds)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as ActivityLog[];
}

export async function appendLog(payload: {
  user_id: string;
  user_display_name?: string;
  type: string;
  description?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const supabase = createClient();
  await supabase.from('activity_logs').insert({
    user_id: payload.user_id,
    user_display_name: payload.user_display_name,
    type: payload.type,
    description: payload.description,
    metadata: (payload.metadata ?? {}) as Json,
  } as LogInsert);
}

/** Fire-and-forget version — never blocks the caller. */
export function appendLogAsync(payload: {
  user_id: string;
  user_display_name?: string;
  type: string;
  description?: string;
  metadata?: Record<string, unknown>;
}): void {
  appendLog(payload).catch((err) => console.error('appendLogAsync error:', err));
}
