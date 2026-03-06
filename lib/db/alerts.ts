import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export type Alert = Database['public']['Tables']['alerts']['Row'];
type AlertInsert = Database['public']['Tables']['alerts']['Insert'];

export async function getAlertsForMember(memberId: string): Promise<Alert[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('alerts')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false });
  return (data ?? []) as Alert[];
}

export async function getAlertsByZoneManager(managerId: string): Promise<Alert[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('alerts')
    .select('*')
    .eq('created_by_user_id', managerId)
    .order('created_at', { ascending: false });
  return (data ?? []) as Alert[];
}

export async function getOpenAlerts(managerId: string): Promise<Alert[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('alerts')
    .select('*')
    .eq('created_by_user_id', managerId)
    .eq('status', 'open')
    .order('created_at', { ascending: false });
  return (data ?? []) as Alert[];
}

export async function createAlert(payload: {
  member_id: string;
  member_name: string;
  created_by_user_id: string;
  title: string;
  description?: string;
  severity?: 'info' | 'warning' | 'critical';
}): Promise<Alert | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('alerts')
    .insert({ ...payload, status: 'open' } as AlertInsert)
    .select()
    .single();
  return data as Alert | null;
}

export async function closeAlert(id: string, closedNotes?: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('alerts').update({
    status: 'closed',
    closed_notes: closedNotes,
    closed_at: new Date().toISOString(),
  } as Database['public']['Tables']['alerts']['Update']).eq('id', id);
}
