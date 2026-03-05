'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface AiCopilotButtonProps {
  section: string;
  fieldName: string;
  currentValue: string;
  context?: string;
  onResult: (text: string) => void;
  label?: string;
}

export default function AiCopilotButton({
  section,
  fieldName,
  currentValue,
  context,
  onResult,
  label = 'Migliora con AI',
}: AiCopilotButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, fieldName, currentValue, context }),
      });
      if (!res.ok) throw new Error('Errore API');
      const data = await res.json();
      onResult(data.result);
    } catch {
      setError('Errore. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || !currentValue.trim()}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-ndp-blue border border-ndp-blue/30 px-3 py-1.5 rounded-lg hover:bg-ndp-blue/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Sparkles size={12} />
        )}
        {loading ? 'Elaborazione...' : label}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
