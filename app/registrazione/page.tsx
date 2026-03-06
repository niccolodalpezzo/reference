'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, MapPin, Briefcase, ArrowRight, CheckCircle2, Sparkles, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { appendLog } from '@/lib/db/logs';

const PROVINCE_ITALIANE = [
  'Agrigento','Alessandria','Ancona','Aosta','Arezzo','Ascoli Piceno','Asti','Avellino',
  'Bari','Belluno','Benevento','Bergamo','Biella','Bologna','Bolzano','Brescia','Brindisi',
  'Cagliari','Caltanissetta','Campobasso','Caserta','Catania','Catanzaro','Chieti','Como',
  'Cosenza','Cremona','Crotone','Cuneo','Enna','Fermo','Ferrara','Firenze','Foggia',
  'Frosinone','Genova','Gorizia','Grosseto','Imperia','Isernia','La Spezia','Latina',
  'Lecce','Lecco','Livorno','Lodi','Lucca','Macerata','Mantova','Massa-Carrara','Matera',
  'Messina','Milano','Modena','Monza e Brianza','Napoli','Novara','Nuoro','Oristano',
  'Padova','Palermo','Parma','Pavia','Perugia','Pesaro e Urbino','Pescara','Piacenza',
  'Pisa','Pistoia','Pordenone','Potenza','Prato','Ragusa','Ravenna','Reggio Calabria',
  'Reggio Emilia','Rieti','Rimini','Roma','Rovigo','Salerno','Sassari','Savona',
  'Siena','Siracusa','Sondrio','Taranto','Teramo','Terni','Torino','Trapani','Trento',
  'Treviso','Trieste','Udine','Varese','Venezia','Vercelli','Verona','Vibo Valentia',
  'Vicenza','Viterbo',
];

const PROVINCE_ZONE: Record<string, string> = {
  'Milano': 'Zona Nord','Monza e Brianza': 'Zona Nord','Bergamo': 'Zona Nord',
  'Brescia': 'Zona Nord','Como': 'Zona Nord','Varese': 'Zona Nord','Lecco': 'Zona Nord',
  'Torino': 'Zona Nord-Ovest','Roma': 'Zona Centro','Napoli': 'Zona Sud',
  'Palermo': 'Zona Sud',
};

export default function RegistrazionePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nome: '', cognome: '', email: '', password: '', confermaPassword: '',
    professione: '', provincia: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = 'Nome richiesto';
    if (!form.cognome.trim()) e.cognome = 'Cognome richiesto';
    if (!form.email.includes('@')) e.email = 'Email non valida';
    if (form.password.length < 6) e.password = 'Minimo 6 caratteri';
    if (form.password !== form.confermaPassword) e.confermaPassword = 'Le password non coincidono';
    if (!form.professione.trim()) e.professione = 'Professione richiesta';
    if (!form.provincia) e.provincia = 'Seleziona una provincia';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const fullName = `${form.nome.trim()} ${form.cognome.trim()}`;
      const zone = PROVINCE_ZONE[form.provincia] ?? 'Zona Nord';

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: { data: { name: fullName } },
      });
      if (authError) { setErrors({ submit: authError.message }); return; }

      const userId = authData.user?.id;
      if (!userId) { setErrors({ submit: 'Errore durante la registrazione.' }); return; }

      // 2. Create user_profile
      await supabase.from('user_profiles').insert({
        id: userId,
        name: fullName,
        role: 'member',
        province: form.provincia,
        city: form.provincia,
        zone,
      });

      // 3. Log registration
      await appendLog({
        user_id: userId,
        user_display_name: fullName,
        type: 'user_registered',
        description: `Account creato — ${form.professione}, ${form.provincia}`,
      });

      setSuccess(true);
      setTimeout(() => router.push('/professionisti/wizard'), 2200);
    } catch (err) {
      setErrors({ submit: 'Errore durante la registrazione. Riprova.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  function field(key: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ndp-bg to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-ndp-text mb-2">Benvenuto nella rete!</h2>
          <p className="text-ndp-muted mb-4">Account creato con successo.</p>
          <div className="bg-ndp-bg rounded-2xl p-4 mb-6">
            <p className="text-sm text-ndp-muted mb-1">Zona assegnata</p>
            <p className="font-semibold text-ndp-blue text-lg">{PROVINCE_ZONE[form.provincia] ?? 'Zona Nord'}</p>
            <p className="text-xs text-ndp-muted mt-1">Provincia: {form.provincia}</p>
          </div>
          <p className="text-sm text-ndp-muted animate-pulse">Reindirizzamento al profilo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ndp-bg via-white to-indigo-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[480px] bg-ndp-blue flex-col justify-between p-12 shrink-0">
        <div>
          <Link href="/" className="flex items-center gap-3 mb-16">
            <img src="/logo.svg" alt="NDP Reference" className="h-10 w-auto" />
          </Link>
          <h1 className="text-4xl font-bold font-display text-white mb-4 leading-tight">
            Entra nel network<br />di fiducia
          </h1>
          <p className="text-indigo-200 text-lg leading-relaxed mb-10">
            Crea il tuo profilo professionale e inizia a ricevere referenze qualificate dalla rete NDP.
          </p>
          <div className="space-y-4">
            {[
              { icon: Sparkles, text: 'AI Copilot per ottimizzare il tuo profilo' },
              { icon: Shield, text: 'Referenze verificate e governance trasparente' },
              { icon: CheckCircle2, text: 'Visibilità immediata nel tuo capitolo' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-indigo-100 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-indigo-300 text-sm">
          Hai già un account?{' '}
          <Link href="/login" className="text-white underline">Accedi qui</Link>
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-start justify-center py-10 px-6 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/"><img src="/logo.svg" alt="NDP Reference" className="h-8 w-auto" /></Link>
          </div>

          <h2 className="text-2xl font-bold text-ndp-text mb-1">Crea il tuo account</h2>
          <p className="text-ndp-muted text-sm mb-8">
            Già registrato?{' '}
            <Link href="/login" className="text-ndp-blue font-medium hover:underline">Accedi</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ndp-text mb-1.5">Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ndp-muted" />
                  <input type="text" value={form.nome} onChange={e => field('nome', e.target.value)} placeholder="Mario"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm ${errors.nome ? 'border-red-400' : 'border-ndp-border focus:border-ndp-blue'} focus:outline-none`} />
                </div>
                {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-ndp-text mb-1.5">Cognome</label>
                <input type="text" value={form.cognome} onChange={e => field('cognome', e.target.value)} placeholder="Rossi"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm ${errors.cognome ? 'border-red-400' : 'border-ndp-border focus:border-ndp-blue'} focus:outline-none`} />
                {errors.cognome && <p className="text-red-500 text-xs mt-1">{errors.cognome}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ndp-text mb-1.5">Email professionale</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ndp-muted" />
                <input type="email" value={form.email} onChange={e => field('email', e.target.value)} placeholder="mario.rossi@studio.it"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm ${errors.email ? 'border-red-400' : 'border-ndp-border focus:border-ndp-blue'} focus:outline-none`} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ndp-text mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ndp-muted" />
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => field('password', e.target.value)} placeholder="Min. 6 caratteri"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm ${errors.password ? 'border-red-400' : 'border-ndp-border focus:border-ndp-blue'} focus:outline-none`} />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-ndp-text mb-1.5">Conferma</label>
                <input type={showPw ? 'text' : 'password'} value={form.confermaPassword} onChange={e => field('confermaPassword', e.target.value)} placeholder="Ripeti password"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm ${errors.confermaPassword ? 'border-red-400' : 'border-ndp-border focus:border-ndp-blue'} focus:outline-none`} />
                {errors.confermaPassword && <p className="text-red-500 text-xs mt-1">{errors.confermaPassword}</p>}
              </div>
            </div>
            <button type="button" onClick={() => setShowPw(v => !v)} className="text-xs text-ndp-muted hover:text-ndp-blue">
              {showPw ? 'Nascondi' : 'Mostra'} password
            </button>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ndp-text mb-1.5">Professione</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ndp-muted" />
                  <input type="text" value={form.professione} onChange={e => field('professione', e.target.value)} placeholder="es. Avvocato"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm ${errors.professione ? 'border-red-400' : 'border-ndp-border focus:border-ndp-blue'} focus:outline-none`} />
                </div>
                {errors.professione && <p className="text-red-500 text-xs mt-1">{errors.professione}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-ndp-text mb-1.5">Provincia</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ndp-muted pointer-events-none" />
                  <select value={form.provincia} onChange={e => field('provincia', e.target.value)}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm appearance-none bg-white ${errors.provincia ? 'border-red-400' : 'border-ndp-border focus:border-ndp-blue'} focus:outline-none`}>
                    <option value="">Seleziona...</option>
                    {PROVINCE_ITALIANE.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                {errors.provincia && <p className="text-red-500 text-xs mt-1">{errors.provincia}</p>}
                {form.provincia && (
                  <p className="text-xs text-ndp-muted mt-1">
                    Zona: <span className="font-semibold text-ndp-blue">{PROVINCE_ZONE[form.provincia] ?? 'Zona Nord'}</span>
                  </p>
                )}
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{errors.submit}</div>
            )}

            <button type="submit" disabled={isSubmitting}
              className="w-full bg-ndp-blue text-white rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 hover:bg-ndp-blue-dark transition-colors disabled:opacity-60 mt-2">
              {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Crea account</span><ArrowRight className="w-5 h-5" /></>}
            </button>

            <p className="text-xs text-center text-ndp-muted">
              Creando un account accetti i{' '}
              <span className="text-ndp-blue cursor-pointer hover:underline">Termini di servizio</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
