'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

const NO_FOOTER_ROUTES = ['/messaggi', '/assistente', '/eventi', '/incontri'];

export default function ClientFooter() {
  const pathname = usePathname();
  const hide = NO_FOOTER_ROUTES.some((r) => pathname?.startsWith(r));
  if (hide) return null;
  return <Footer />;
}
