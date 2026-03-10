import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SECTION_PROMPTS: Record<string, string> = {
  identity: 'Stai aiutando un professionista BNI a descrivere la propria identità professionale. Migliora il testo rendendolo più chiaro, professionale e convincente. Mantieni la prima persona.',
  whatIDo: 'Stai aiutando un professionista BNI a descrivere i casi tipici che gestisce e le frasi che riconoscono un cliente ideale. Rendi il testo più specifico, concreto e orientato ai trigger di referral.',
  gains: 'Stai aiutando un professionista BNI a compilare la sezione GAINS (Goals, Achievements, Interests, Networks, Skills). Migliora il testo rendendolo autentico, specifico e memorabile.',
  idealClient: 'Stai aiutando un professionista BNI a descrivere il proprio cliente ideale. Rendi il profilo più preciso, escludendo i clienti non adatti e valorizzando le caratteristiche di chi porta valore.',
  references: 'Stai aiutando un professionista BNI a descrivere il tipo di referenza che cerca. Rendi il testo chiaro, concreto e actionable per i colleghi del network.',
  powerTeam: 'Stai aiutando un professionista BNI a descrivere il proprio power team. Migliora il testo rendendolo specifico sui ruoli complementari e sul valore della collaborazione.',
  personal: 'Stai aiutando un professionista BNI a condividere informazioni personali leggere. Rendi il testo autentico, simpatico e memorabile — deve aiutare le persone a ricordarlo.',
};

export async function POST(req: NextRequest) {
  try {
    const { section, fieldName, currentValue, context } = await req.json();

    if (!section || !fieldName || !currentValue) {
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 });
    }

    const sectionPrompt = SECTION_PROMPTS[section] ?? 'Migliora il testo professionale seguente.';

    const systemPrompt = `${sectionPrompt}

REGOLE:
1. Rispondi SEMPRE in italiano.
2. Restituisci SOLO il testo migliorato, senza spiegazioni, senza prefazioni, senza commenti.
3. Mantieni la lunghezza simile all'originale (±30%).
4. Non inventare informazioni — migliora solo quello che è già presente.
5. Usa un tono professionale ma personale, adatto al networking BNI.`;

    const userMessage = `Campo: ${fieldName}
${context ? `Contesto aggiuntivo: ${context}\n` : ''}
Testo da migliorare:
${currentValue}`;

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.6,
      max_tokens: 400,
    });

    const result = response.choices[0]?.message?.content?.trim() ?? '';
    return NextResponse.json({ result });
  } catch (error) {
    console.error('AI Copilot error:', error);
    return NextResponse.json({ error: 'Errore interno. Riprova.' }, { status: 500 });
  }
}
