// Auth helpers — thin wrappers over Supabase Auth

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Legacy no-op stubs (kept for compatibility with any imports that haven't been updated yet)
export function getStoredUser() { return null; }
export function saveUser() {}
export function clearUser() {}
