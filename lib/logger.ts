import { appendLog } from '@/lib/db/logs';

/**
 * Log a user action to Supabase activity_logs.
 * Drop-in replacement for the old localStorage-based logger.
 */
export function log(
  user: { id: string; name: string } | null,
  type: string,
  description: string,
  metadata?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined') return;
  if (!user) return;
  // Fire-and-forget — no await needed for activity logging
  appendLog({
    user_id: user.id,
    user_display_name: user.name,
    type,
    description,
    metadata,
  }).catch(() => {/* ignore logging failures */});
}
