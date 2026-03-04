import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'NDP Reference — Trova il Professionista Giusto con l\'AI',
  description:
    'NDP Reference è la piattaforma AI-powered per trovare professionisti fidati nella rete di networking. Chiedi all\'intelligenza artificiale e trova il tuo commercialista, avvocato o consulente in secondi.',
  keywords: 'networking professionale, AI, avvocato, commercialista, consulente, BNI, referral',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
