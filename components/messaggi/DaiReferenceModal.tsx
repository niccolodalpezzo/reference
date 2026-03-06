'use client';

import { useState } from 'react';
import { X, Award, Info } from 'lucide-react';
import { createReference } from '@/lib/storage/references';
import { addMessage } from '@/lib/storage/messages';
import { log } from '@/lib/logger';
import { useAuth } from '@/context/AuthContext';
import { ContactType, UrgencyLevel } from '@/lib/types';
import { getProfessionalById } from '@/lib/utils';
import clsx from 'clsx';

interface Props {
  conversationId: string;
  professionalId: string;
  onClose: () => void;
  onCreated: () => void;
}

const CONTACT_TYPES: { value: ContactType; label: string; desc: string }[] = [
  { value: 'lead', label: 'Lead', desc: 'Contatto interessato ma non ancora qualificato' },
  { value: 'referenza', label: 'Referenza', desc: 'Contatto qualificato pronto ad acquistare' },
  { value: 'opportunità', label: 'Opportunità', desc: 'Progetto o collaborazione specifica' },
];

const URGENCY_LEVELS: { value: UrgencyLevel; label: string; color: string }[] = [
  { value: 'bassa', label: 'Bassa', color: 'text-green-700 bg-green-50 border-green-200 hover:border-green-400' },
  { value: 'media', label: 'Media', color: 'text-yellow-700 bg-yellow-50 border-yellow-200 hover:border-yellow-400' },
  { value: 'alta', label: 'Alta', color: 'text-red-700 bg-red-50 border-red-200 hover:border-red-400' },
];

export default function DaiReferenceModal({ conversationId, professionalId, onClose, onCreated }: Props) {
  const { user } = useAuth();
  const pro = getProfessionalById(professionalId);

  const [form, setForm] = useState({
    contactName: '',
    contactType: 'referenza' as ContactType,
    contactInfo: '',
    notes: '',
    urgency: 'media' as UrgencyLevel,
    hasConsent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.contactName.trim()) e.contactName = 'Nome richiesto';
    if (!form.contactInfo.trim()) e.contactInfo = 'Contatto richiesto';
    if (!form.notes.trim()) e.notes = 'Descrizione richiesta';
    if (!form.hasConsent) e.hasConsent = 'Devi confermare il consenso';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate() || !user) return;
    setIsSubmitting(true);

    try {
      const ref = createReference({
        conversationId,
        fromUserId: user.id,
        fromUserName: user.name,
        toProfessionalId: professionalId,
        toProfessionalName: pro?.name ?? 'Professionista',
        contactName: form.contactName.trim(),
        contactType: form.contactType,
        contactInfo: form.contactInfo.trim(),
        notes: form.notes.trim(),
        urgency: form.urgency,
        hasConsent: form.hasConsent,
      });

      // Add reference card message to conversation
      addMessage({
        conversationId,
        senderId: user.id,
        senderName: user.name,
        content: `Ho una referenza per te: ${form.contactName}`,
        type: 'reference_card',
        referenceId: ref.id,
      });

      log(user, 'reference_created', `Referenza inviata a ${pro?.name ?? 'professionista'}: ${form.contactName} (${form.contactType})`, {
        referenceId: ref.id,
        urgency: form.urgency,
      });

      onCreated();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Gold header */}
        <div className="bg-gradient-to-r from-ndp-gold to-ndp-gold-dark px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">Dai Reference</h2>
                <p className="text-white/80 text-xs">Per {pro?.name ?? 'il professionista'}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {/* Info banner */}
          <div className="flex gap-2.5 bg-ndp-bg rounded-xl p-3">
            <Info className="w-4 h-4 text-ndp-blue shrink-0 mt-0.5" />
            <p className="text-xs text-ndp-muted leading-relaxed">
              <span className="font-semibold text-ndp-blue">+10 punti immediati</span> per ogni referenza inviata.
              Se approvata dal Responsabile di Zona, ricevi <span className="font-semibold text-ndp-gold-dark">+30 punti bonus</span> (totale +40).
            </p>
          </div>

          {/* Contact name */}
          <div>
            <label className="block text-xs font-bold text-ndp-text mb-1.5">Nome del contatto *</label>
            <input
              type="text"
              value={form.contactName}
              onChange={(e) => { setForm((f) => ({ ...f, contactName: e.target.value })); setErrors((er) => ({ ...er, contactName: '' })); }}
              placeholder="es. Dott. Mario Rossi"
              className={clsx('w-full px-3.5 py-2.5 rounded-xl border text-sm', errors.contactName ? 'border-red-400' : 'border-ndp-border focus:border-ndp-blue', 'focus:outline-none')}
            />
            {errors.contactName && <p className="text-red-500 text-xs mt-1">{errors.contactName}</p>}
          </div>

          {/* Contact type */}
          <div>
            <label className="block text-xs font-bold text-ndp-text mb-2">Tipo di contatto *</label>
            <div className="grid grid-cols-3 gap-2">
              {CONTACT_TYPES.map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, contactType: value }))}
                  className={clsx(
                    'p-3 rounded-xl border-2 text-left transition-all',
                    form.contactType === value
                      ? 'border-ndp-blue bg-ndp-blue/5'
                      : 'border-ndp-border hover:border-ndp-blue/40'
                  )}
                >
                  <p className="text-xs font-bold text-ndp-text mb-0.5">{label}</p>
                  <p className="text-[10px] text-ndp-muted leading-tight">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Contact info */}
          <div>
            <label className="block text-xs font-bold text-ndp-text mb-1.5">Email o telefono *</label>
            <input
              type="text"
              value={form.contactInfo}
              onChange={(e) => { setForm((f) => ({ ...f, contactInfo: e.target.value })); setErrors((er) => ({ ...er, contactInfo: '' })); }}
              placeholder="email@azienda.it o +39 333 xxx xxxx"
              className={clsx('w-full px-3.5 py-2.5 rounded-xl border text-sm', errors.contactInfo ? 'border-red-400' : 'border-ndp-border focus:border-ndp-blue', 'focus:outline-none')}
            />
            {errors.contactInfo && <p className="text-red-500 text-xs mt-1">{errors.contactInfo}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-ndp-text mb-1.5">Perché è una buona referenza *</label>
            <textarea
              value={form.notes}
              onChange={(e) => { setForm((f) => ({ ...f, notes: e.target.value })); setErrors((er) => ({ ...er, notes: '' })); }}
              placeholder="Descrivi brevemente il bisogno del contatto e perché è adatto..."
              rows={3}
              className={clsx('w-full px-3.5 py-2.5 rounded-xl border text-sm resize-none', errors.notes ? 'border-red-400' : 'border-ndp-border focus:border-ndp-blue', 'focus:outline-none')}
            />
            {errors.notes && <p className="text-red-500 text-xs mt-1">{errors.notes}</p>}
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-xs font-bold text-ndp-text mb-1.5">Urgenza</label>
            <div className="flex gap-1.5">
              {URGENCY_LEVELS.map(({ value, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, urgency: value }))}
                  className={clsx(
                    'flex-1 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all',
                    form.urgency === value ? color : 'border-ndp-border text-ndp-muted hover:border-gray-300'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Consent */}
          <div className={clsx('p-3.5 rounded-xl border-2', errors.hasConsent ? 'border-red-400 bg-red-50' : 'border-ndp-border')}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasConsent}
                onChange={(e) => { setForm((f) => ({ ...f, hasConsent: e.target.checked })); setErrors((er) => ({ ...er, hasConsent: '' })); }}
                className="mt-0.5 accent-ndp-blue"
              />
              <span className="text-xs text-ndp-text leading-relaxed">
                <span className="font-bold">Ho il consenso del contatto</span> a condividere i suoi dati con questo professionista della rete NDP Reference.
              </span>
            </label>
            {errors.hasConsent && <p className="text-red-500 text-xs mt-1.5 ml-6">{errors.hasConsent}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-ndp-border flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-ndp-border text-sm font-medium text-ndp-muted hover:bg-ndp-bg transition-colors">
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-ndp-gold to-ndp-gold-dark text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Award className="w-4 h-4" />
                Invia Referenza
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
