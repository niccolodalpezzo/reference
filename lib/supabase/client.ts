import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

// Fallback placeholder values allow the build to succeed when env vars
// are not yet injected (e.g. during `next build` on Vercel before runtime).
// At runtime the real values will always be present.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}
