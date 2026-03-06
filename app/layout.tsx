import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import ClientFooter from '@/components/ClientFooter';
import { AuthProvider } from '@/context/AuthContext';
import SeedProvider from '@/components/SeedProvider';

export const metadata: Metadata = {
  title: 'NDP Reference — Il Network di Fiducia per Professionisti Verificati',
  description:
    "NDP Reference è la piattaforma AI-powered per trovare professionisti fidati nella rete BNI. Usa l'Assistente AI per trovare il tuo commercialista, avvocato o consulente in secondi.",
  keywords: 'networking professionale, AI, avvocato, commercialista, consulente, BNI, referral',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <AuthProvider>
          <SeedProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <ClientFooter />
          </SeedProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
