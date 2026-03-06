import { createClient } from '@/lib/supabase/client';
import type { Database, Json } from '@/lib/supabase/types';
import type { WizardProfile } from '@/lib/types';

type WizardRow = Database['public']['Tables']['wizard_profiles']['Row'];

export async function getWizardProfile(userId: string): Promise<{ profile: WizardProfile | null; completionPct: number }> {
  const supabase = createClient();
  const { data } = await supabase
    .from('wizard_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (!data) return { profile: null, completionPct: 0 };
  const row = data as WizardRow;
  return { profile: row.profile_data as unknown as WizardProfile, completionPct: row.completion_pct };
}

export async function saveWizardProfile(userId: string, profile: WizardProfile, completionPct: number): Promise<void> {
  const supabase = createClient();
  await supabase.from('wizard_profiles').upsert({
    user_id: userId,
    profile_data: profile as unknown as Json,
    completion_pct: completionPct,
    updated_at: new Date().toISOString(),
  } as Database['public']['Tables']['wizard_profiles']['Insert']);
}
