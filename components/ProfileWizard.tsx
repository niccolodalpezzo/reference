'use client';

import { useState } from 'react';
import AiCopilotButton from './AiCopilotButton';
import { ChevronDown, ChevronUp, CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { WizardProfile } from '@/lib/types';
import { demoMarcoProfile } from '@/lib/memberData';

const SECTIONS = [
  { id: 'identity', label: 'Identità professionale', step: 1 },
  { id: 'whatIDo', label: 'Cosa faccio (trigger phrases)', step: 2 },
  { id: 'gains', label: 'GAINS', step: 3 },
  { id: 'idealClient', label: 'Clienti ideali', step: 4 },
  { id: 'references', label: 'Referenze', step: 5 },
  { id: 'powerTeam', label: 'Power Team', step: 6 },
  { id: 'personal', label: 'Info personali', step: 7 },
];

function SectionHeader({
  label,
  step,
  isOpen,
  isComplete,
  onToggle,
}: {
  label: string;
  step: number;
  isOpen: boolean;
  isComplete: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-5 text-left hover:bg-ndp-bg/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        {isComplete ? (
          <CheckCircle2 size={20} className="text-green-500 shrink-0" />
        ) : (
          <Circle size={20} className="text-ndp-muted shrink-0" />
        )}
        <div>
          <span className="text-xs text-ndp-muted font-medium">Sezione {step}</span>
          <p className="font-semibold text-ndp-text text-sm">{label}</p>
        </div>
      </div>
      {isOpen ? <ChevronUp size={18} className="text-ndp-muted" /> : <ChevronDown size={18} className="text-ndp-muted" />}
    </button>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  section,
  fieldName,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  section: string;
  fieldName: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-ndp-text">{label}</label>
        <AiCopilotButton
          section={section}
          fieldName={fieldName}
          currentValue={value}
          onResult={onChange}
        />
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-ndp-border rounded-xl text-sm text-ndp-text placeholder-ndp-muted focus:outline-none focus:border-ndp-blue/50 focus:ring-1 focus:ring-ndp-blue/20 transition-all resize-none"
      />
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ndp-text mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-ndp-border rounded-xl text-sm text-ndp-text placeholder-ndp-muted focus:outline-none focus:border-ndp-blue/50 focus:ring-1 focus:ring-ndp-blue/20 transition-all"
      />
    </div>
  );
}

function TagsField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const t = draft.trim();
    if (t && !values.includes(t)) onChange([...values, t]);
    setDraft('');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-ndp-text mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2 min-h-8">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1.5 text-xs bg-ndp-blue/10 text-ndp-blue px-2.5 py-1 rounded-full"
          >
            {v}
            <button onClick={() => onChange(values.filter((x) => x !== v))} type="button">
              <Trash2 size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          placeholder={placeholder ?? 'Aggiungi...'}
          className="flex-1 px-4 py-2 border border-ndp-border rounded-xl text-sm focus:outline-none focus:border-ndp-blue/50 transition-all"
        />
        <button
          type="button"
          onClick={addTag}
          className="p-2 border border-ndp-border rounded-xl text-ndp-muted hover:text-ndp-blue hover:border-ndp-blue/30 transition-all"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export default function ProfileWizard({ onSave }: { onSave?: (profile: WizardProfile) => void }) {
  const [profile, setProfile] = useState<WizardProfile>(demoMarcoProfile);
  const [openSection, setOpenSection] = useState<string>('identity');
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof WizardProfile>(key: K, value: WizardProfile[K]) => {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved(false);
  };

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? '' : id));
  };

  const isSectionComplete = (id: string): boolean => {
    switch (id) {
      case 'identity': return !!(profile.businessName && profile.mainServices.length > 0);
      case 'whatIDo': return !!(profile.typicalCases && profile.triggerPhrases.length > 0);
      case 'gains': return !!(profile.goals && profile.achievements);
      case 'idealClient': return !!(profile.idealClientProfile && profile.topClients.length > 0);
      case 'references': return !!(profile.goodReference && profile.badReference);
      case 'powerTeam': return profile.powerTeam.length > 0;
      case 'personal': return !!profile.personalInfo;
      default: return false;
    }
  };

  const handleSave = () => {
    onSave?.(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const completedSections = SECTIONS.filter((s) => isSectionComplete(s.id)).length;
  const completionPct = Math.round((completedSections / SECTIONS.length) * 100);

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="bg-white rounded-2xl border border-ndp-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-ndp-text">Completamento profilo</span>
          <span className="text-sm font-bold text-ndp-gold-dark">{completionPct}%</span>
        </div>
        <div className="h-2 bg-ndp-bg rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-ndp-gold to-ndp-gold-dark rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <p className="text-xs text-ndp-muted mt-2">
          {completedSections}/{SECTIONS.length} sezioni completate — più completo il profilo, più referral ricevi.
        </p>
      </div>

      {/* Sections */}
      {SECTIONS.map((section) => (
        <div key={section.id} className="bg-white rounded-2xl border border-ndp-border shadow-sm overflow-hidden">
          <SectionHeader
            label={section.label}
            step={section.step}
            isOpen={openSection === section.id}
            isComplete={isSectionComplete(section.id)}
            onToggle={() => toggleSection(section.id)}
          />

          {openSection === section.id && (
            <div className="px-5 pb-6 border-t border-ndp-border space-y-5 pt-5">
              {section.id === 'identity' && (
                <>
                  <InputField label="Nome attività / studio" value={profile.businessName} onChange={(v) => set('businessName', v)} placeholder="Es. Studio Legale Rossi" />
                  <InputField label="Anni di esperienza" value={String(profile.yearsExperience)} onChange={(v) => set('yearsExperience', parseInt(v) || 0)} type="number" placeholder="12" />
                  <TagsField label="Città operative" values={profile.cities} onChange={(v) => set('cities', v)} placeholder="Aggiungi città..." />
                  <TagsField label="Settori principali" values={profile.sectors} onChange={(v) => set('sectors', v)} placeholder="Aggiungi settore..." />
                  <TagsField label="Servizi principali" values={profile.mainServices} onChange={(v) => set('mainServices', v)} placeholder="Aggiungi servizio..." />
                </>
              )}

              {section.id === 'whatIDo' && (
                <>
                  <TextareaField
                    label="Casi tipici che gestisco"
                    value={profile.typicalCases}
                    onChange={(v) => set('typicalCases', v)}
                    section="whatIDo"
                    fieldName="Casi tipici"
                    placeholder="Descrivi i casi più frequenti che risolvi..."
                    rows={5}
                  />
                  <TagsField
                    label="Trigger phrases (parole che identificano un tuo cliente ideale)"
                    values={profile.triggerPhrases}
                    onChange={(v) => set('triggerPhrases', v)}
                    placeholder="Es. contratto, acquisizione, marchio..."
                  />
                </>
              )}

              {section.id === 'gains' && (
                <>
                  <TextareaField label="Goals (obiettivi)" value={profile.goals} onChange={(v) => set('goals', v)} section="gains" fieldName="Goals" placeholder="Cosa vuoi raggiungere nei prossimi 12 mesi?" />
                  <TextareaField label="Achievements (risultati)" value={profile.achievements} onChange={(v) => set('achievements', v)} section="gains" fieldName="Achievements" placeholder="I tuoi risultati più importanti..." />
                  <TextareaField label="Interests (interessi)" value={profile.interests} onChange={(v) => set('interests', v)} section="gains" fieldName="Interests" rows={3} placeholder="Cosa ti appassiona fuori dal lavoro?" />
                  <TextareaField label="Networks (reti e associazioni)" value={profile.networks} onChange={(v) => set('networks', v)} section="gains" fieldName="Networks" rows={3} placeholder="A quali network/associazioni appartieni?" />
                  <TextareaField label="Skills (competenze distintive)" value={profile.skills} onChange={(v) => set('skills', v)} section="gains" fieldName="Skills" rows={3} placeholder="Cosa sai fare meglio di altri?" />
                </>
              )}

              {section.id === 'idealClient' && (
                <>
                  <TextareaField
                    label="Profilo del cliente ideale"
                    value={profile.idealClientProfile}
                    onChange={(v) => set('idealClientProfile', v)}
                    section="idealClient"
                    fieldName="Profilo cliente ideale"
                    rows={4}
                    placeholder="Chi è il tuo cliente ideale? Settore, dimensione, area geografica..."
                  />
                  <div>
                    <label className="block text-sm font-medium text-ndp-text mb-3">Top 3 clienti tipo (esempi)</label>
                    <div className="space-y-3">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={profile.topClients[i]?.sector ?? ''}
                            onChange={(e) => {
                              const clients = [...profile.topClients];
                              clients[i] = { ...(clients[i] ?? { sector: '', area: '', work: '' }), sector: e.target.value };
                              set('topClients', clients);
                            }}
                            placeholder="Settore"
                            className="px-3 py-2 border border-ndp-border rounded-lg text-xs text-ndp-text placeholder-ndp-muted focus:outline-none focus:border-ndp-blue/50"
                          />
                          <input
                            type="text"
                            value={profile.topClients[i]?.area ?? ''}
                            onChange={(e) => {
                              const clients = [...profile.topClients];
                              clients[i] = { ...(clients[i] ?? { sector: '', area: '', work: '' }), area: e.target.value };
                              set('topClients', clients);
                            }}
                            placeholder="Area"
                            className="px-3 py-2 border border-ndp-border rounded-lg text-xs text-ndp-text placeholder-ndp-muted focus:outline-none focus:border-ndp-blue/50"
                          />
                          <input
                            type="text"
                            value={profile.topClients[i]?.work ?? ''}
                            onChange={(e) => {
                              const clients = [...profile.topClients];
                              clients[i] = { ...(clients[i] ?? { sector: '', area: '', work: '' }), work: e.target.value };
                              set('topClients', clients);
                            }}
                            placeholder="Tipo di lavoro svolto"
                            className="px-3 py-2 border border-ndp-border rounded-lg text-xs text-ndp-text placeholder-ndp-muted focus:outline-none focus:border-ndp-blue/50"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {section.id === 'references' && (
                <>
                  <TextareaField
                    label="Buona referenza (come mi presenteresti?)"
                    value={profile.goodReference}
                    onChange={(v) => set('goodReference', v)}
                    section="references"
                    fieldName="Buona referenza"
                    rows={4}
                    placeholder="La migliore referenza che puoi darmi è..."
                  />
                  <TextareaField
                    label="Referenza da evitare"
                    value={profile.badReference}
                    onChange={(v) => set('badReference', v)}
                    section="references"
                    fieldName="Referenza da evitare"
                    rows={3}
                    placeholder="Non ho bisogno di referenze per..."
                  />
                  <TextareaField
                    label="Come posso aiutare la rete"
                    value={profile.howHelp}
                    onChange={(v) => set('howHelp', v)}
                    section="references"
                    fieldName="Come aiuto la rete"
                    rows={3}
                    placeholder="Cosa offro ai colleghi BNI che portano referral..."
                  />
                  <TagsField
                    label="Altre fonti di referral (fuori BNI)"
                    values={profile.otherSources ? [profile.otherSources] : []}
                    onChange={(v) => set('otherSources', v.join(', '))}
                    placeholder="Aggiungi fonte..."
                  />
                </>
              )}

              {section.id === 'powerTeam' && (
                <>
                  <TagsField
                    label="Power Team (figure complementari)"
                    values={profile.powerTeam}
                    onChange={(v) => set('powerTeam', v)}
                    placeholder="Es. Commercialista, Consulente finanziario..."
                  />
                  <p className="text-xs text-ndp-muted">
                    Il tuo power team è composto da professionisti che si rivolgono agli stessi clienti con servizi complementari.
                  </p>
                </>
              )}

              {section.id === 'personal' && (
                <TextareaField
                  label="Info personali (hobby, valori, curiosità)"
                  value={profile.personalInfo}
                  onChange={(v) => set('personalInfo', v)}
                  section="personal"
                  fieldName="Info personali"
                  rows={5}
                  placeholder="Raccontati: cosa fai nel tempo libero, perché hai scelto questa professione, cosa ti rende unico..."
                />
              )}
            </div>
          )}
        </div>
      ))}

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 bg-ndp-blue text-white font-bold px-8 py-3 rounded-xl hover:bg-ndp-blue-dark transition-all text-sm"
        >
          {saved ? <CheckCircle2 size={16} /> : null}
          {saved ? 'Salvato!' : 'Salva profilo'}
        </button>
      </div>
    </div>
  );
}
