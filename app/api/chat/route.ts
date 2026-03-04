import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { professionals } from '@/lib/data';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Sei l'assistente AI di NDP Reference, la piattaforma intelligente di networking professionale.
Il tuo compito è aiutare gli utenti a trovare il professionista giusto nella rete NDP.

Hai accesso al seguente elenco di professionisti nella rete NDP Reference:

[PROFESSIONALS_DATA]

Istruzioni:
1. Analizza la richiesta dell'utente: identifica la categoria professionale cercata, la città e le specialità
2. Seleziona i 2-4 professionisti più adatti dal database sopra (solo quelli realmente presenti)
3. Rispondi in modo caldo, professionale e in italiano
4. Presenta brevemente i professionisti selezionati con nome, specialità e perché sono adatti
5. ALLA FINE della risposta, su una riga separata, includi SEMPRE questo blocco (non omettere mai):
   MATCHED_IDS:["id1","id2"]

Regole importanti:
- Usa SOLO professionisti presenti nel database. Non inventarne altri.
- Se non ci sono professionisti per la città esatta, suggerisci quelli più vicini geograficamente
- Se la categoria non è chiara, chiedi una breve chiarificazione
- Mantieni un tono professionale ma accessibile, come un consulente esperto
- Il blocco MATCHED_IDS deve contenere gli ID esatti dal database`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Inject professionals data into system prompt
    const professionalsJson = JSON.stringify(
      professionals.map((p) => ({
        id: p.id,
        name: p.name,
        profession: p.profession,
        category: p.category,
        city: p.city,
        chapter: p.chapter,
        specialties: p.specialties,
        yearsInBNI: p.yearsInBNI,
        referralsGiven: p.referralsGiven,
        rating: p.rating,
      })),
      null,
      2
    );

    const systemPrompt = SYSTEM_PROMPT.replace('[PROFESSIONALS_DATA]', professionalsJson);

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 1024,
    });

    // Create a streaming response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Errore interno. Riprova.' }, { status: 500 });
  }
}
