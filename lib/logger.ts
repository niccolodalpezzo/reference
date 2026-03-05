import { ActivityLogType, DemoUser } from '@/lib/types';
import { appendLog } from '@/lib/storage/logs';

export function log(
  user: DemoUser | null,
  type: ActivityLogType,
  description: string,
  metadata?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined') return;
  if (!user) return;
  appendLog({
    userId: user.id,
    userDisplayName: user.name,
    type,
    description,
    metadata,
  });
}
