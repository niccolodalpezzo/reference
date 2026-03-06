'use client';

import { useEffect } from 'react';
import { initSeed } from '@/lib/seed';

export default function SeedProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initSeed();
  }, []);

  return <>{children}</>;
}
