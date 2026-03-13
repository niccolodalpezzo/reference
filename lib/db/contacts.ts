import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export type ContactRow = Database['public']['Tables']['private_contacts']['Row'];

export interface ContactInput {
  nome: string;
  cognome: string;
  professione: string;
}

export async function getContacts(userId: string): Promise<ContactRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('private_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return (data ?? []) as ContactRow[];
}

export async function getContactsCount(userId: string): Promise<number> {
  const supabase = createClient();
  const { count } = await supabase
    .from('private_contacts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  return count ?? 0;
}

export async function addContact(
  userId: string,
  input: ContactInput
): Promise<{ data: ContactRow | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('private_contacts')
    .insert({
      user_id: userId,
      nome: input.nome.trim(),
      cognome: input.cognome.trim(),
      professione: input.professione.trim(),
    } as Database['public']['Tables']['private_contacts']['Insert'])
    .select()
    .single();

  if (error) {
    // Unique constraint violation = duplicate
    if (error.code === '23505') {
      return { data: null, error: 'Contatto già presente nella tua rete.' };
    }
    return { data: null, error: 'Errore durante il salvataggio.' };
  }

  return { data: data as ContactRow, error: null };
}

export async function updateContact(
  contactId: string,
  input: Partial<ContactInput>
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('private_contacts')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    } as Database['public']['Tables']['private_contacts']['Update'])
    .eq('id', contactId);

  if (error) {
    if (error.code === '23505') {
      return { error: 'Contatto già presente nella tua rete.' };
    }
    return { error: 'Errore durante l\'aggiornamento.' };
  }
  return { error: null };
}

export async function deleteContact(contactId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('private_contacts').delete().eq('id', contactId);
}

export async function migrateFromLocalStorage(
  userId: string,
  localContacts: Array<{ nome: string; cognome: string; professione: string }>
): Promise<number> {
  if (!localContacts.length) return 0;

  const supabase = createClient();
  const rows = localContacts.map((c) => ({
    user_id: userId,
    nome: c.nome.trim(),
    cognome: (c.cognome ?? '').trim(),
    professione: (c.professione ?? '').trim(),
  }));

  // Insert ignoring duplicates (on conflict do nothing via upsert-like approach)
  // Since we can't use ON CONFLICT with the Supabase JS client on a functional unique index,
  // we insert one by one and ignore errors
  let migrated = 0;
  for (const row of rows) {
    const { error } = await supabase
      .from('private_contacts')
      .insert(row as Database['public']['Tables']['private_contacts']['Insert']);
    if (!error) migrated++;
  }

  return migrated;
}
