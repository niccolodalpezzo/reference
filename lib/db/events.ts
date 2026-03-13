import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export type EventRow = Database['public']['Tables']['events']['Row'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type RegistrationRow = Database['public']['Tables']['event_registrations']['Row'];

// ─── READ ────────────────────────────────────────────────────────────────────

export async function getAllEvents(): Promise<EventRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('events')
    .select('*')
    .order('data_evento', { ascending: true });
  return (data ?? []) as EventRow[];
}

export async function getActiveEvents(): Promise<EventRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'attivo')
    .order('data_evento', { ascending: true });
  return (data ?? []) as EventRow[];
}

export async function getEventById(id: string): Promise<EventRow | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
  return data as EventRow | null;
}

export async function getEventsByManager(managerId: string): Promise<EventRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('responsabile_id', managerId)
    .order('data_evento', { ascending: false });
  return (data ?? []) as EventRow[];
}

// ─── WRITE ───────────────────────────────────────────────────────────────────

export async function createEvent(payload: EventInsert): Promise<EventRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('events')
    .insert(payload as Database['public']['Tables']['events']['Insert'])
    .select()
    .single();
  if (error) {
    console.error('createEvent error:', error.message, error.code, error.details);
    return null;
  }
  return data as EventRow | null;
}

export async function updateEvent(id: string, payload: Partial<EventInsert>): Promise<EventRow | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('events')
    .update(payload as Database['public']['Tables']['events']['Update'])
    .eq('id', id)
    .select()
    .single();
  return data as EventRow | null;
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('events').delete().eq('id', id);
}

// ─── STATS ───────────────────────────────────────────────────────────────────

export async function getEventStats(
  managerId: string,
  preloadedEvents?: EventRow[],
): Promise<{
  total: number;
  upcoming: number;
  totalRegistrations: number;
}> {
  const events = preloadedEvents ?? await getEventsByManager(managerId);
  const today = new Date().toISOString().split('T')[0];
  const upcoming = events.filter((e) => e.data_evento >= today && e.status === 'attivo').length;
  const eventIds = events.map((e) => e.id);

  let totalRegistrations = 0;
  if (eventIds.length > 0) {
    const supabase = createClient();
    const { count } = await supabase
      .from('event_registrations')
      .select('id', { count: 'exact', head: true })
      .in('event_id', eventIds);
    totalRegistrations = count ?? 0;
  }

  return { total: events.length, upcoming, totalRegistrations };
}

// ─── REGISTRATIONS ───────────────────────────────────────────────────────────

export async function registerForEvent(eventId: string, userId: string): Promise<RegistrationRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('event_registrations')
    .insert({ event_id: eventId, professionista_id: userId })
    .select()
    .single();
  // 23505 = unique_violation (duplicate registration)
  if (error?.code === '23505') return null;
  return data as RegistrationRow | null;
}

export async function unregisterFromEvent(eventId: string, userId: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from('event_registrations')
    .delete()
    .eq('event_id', eventId)
    .eq('professionista_id', userId);
}

export async function isRegistered(eventId: string, userId: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from('event_registrations')
    .select('id')
    .eq('event_id', eventId)
    .eq('professionista_id', userId)
    .single();
  return !!data;
}

export async function getRegistrationsForEvent(eventId: string): Promise<RegistrationRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });
  return (data ?? []) as RegistrationRow[];
}

export async function getRegistrationCount(eventId: string): Promise<number> {
  const supabase = createClient();
  const { count } = await supabase
    .from('event_registrations')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId);
  return count ?? 0;
}

export async function getEventRegistrationsWithProfiles(eventId: string): Promise<Array<
  RegistrationRow & { user_profiles: { name: string; city: string | null; province: string | null } }
>> {
  const supabase = createClient();
  const { data } = await supabase
    .from('event_registrations')
    .select('*, user_profiles(name, city, province)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });
  return (data ?? []) as Array<RegistrationRow & { user_profiles: { name: string; city: string | null; province: string | null } }>;
}

/** Batch: returns a map of eventId → registration count. Single query. */
export async function getRegistrationCountsBatch(
  eventIds: string[]
): Promise<Record<string, number>> {
  if (!eventIds.length) return {};
  const supabase = createClient();
  const { data } = await supabase
    .from('event_registrations')
    .select('event_id')
    .in('event_id', eventIds);
  const counts: Record<string, number> = {};
  for (const id of eventIds) counts[id] = 0;
  for (const row of (data ?? []) as { event_id: string }[]) {
    counts[row.event_id] = (counts[row.event_id] ?? 0) + 1;
  }
  return counts;
}

/** Batch: returns the set of event IDs the user is registered for. Single query. */
export async function getUserRegisteredEventIds(
  userId: string,
  eventIds: string[]
): Promise<Set<string>> {
  if (!eventIds.length) return new Set();
  const supabase = createClient();
  const { data } = await supabase
    .from('event_registrations')
    .select('event_id')
    .eq('professionista_id', userId)
    .in('event_id', eventIds);
  return new Set(((data ?? []) as { event_id: string }[]).map((r) => r.event_id));
}
