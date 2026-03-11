import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { professionals } from '@/lib/data';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SYSTEM_PROMPT = `Sei l'assistente AI di NDP Reference. Il tuo unico compito è trovare i professionisti più adatti dalla rete NDP.

Hai accesso al seguente database di professionisti:

[PROFESSIONALS_DATA]

REGOLE ASSOLUTE — non derogarle mai:
1. Rispondi SEMPRE in italiano.
2. NON usare mai markdown: niente grassetto con asterischi, niente corsivo, niente titoli con #, niente elenchi con trattini.
3. NON chiedere mai chiarimenti. Anche se la richiesta è vaga, analizza e fornisci subito i migliori candidati dal database.
4. Seleziona sempre 2-4 professionisti pertinenti. Se la città non è specificata, mostra i migliori indipendentemente dalla città.
5. Rispondi in modo conciso: massimo 2-3 frasi introduttive, poi elenca i professionisti per nome con una riga di motivo.
6. SEMPRE alla fine della risposta, su una riga separata, includi esattamente questo blocco con gli ID reali dal database:
   MATCHED_IDS:["id1","id2"]

Formato risposta ideale:
Ho trovato N professionisti adatti per la tua esigenza. Ecco i più rilevanti nella rete NDP:

Nome — Professione, Città. Una frase sul perché è adatto.
Nome — Professione, Città. Una frase sul perché è adatto.

MATCHED_IDS:["xxx","yyy"]`;

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
        yearsInNDP: p.yearsInNDP,
        referralsGiven: p.referralsGiven,
        rating: p.rating,
      })),
      null,
      2
    );

    const systemPrompt = SYSTEM_PROMPT.replace('[PROFESSIONALS_DATA]', professionalsJson);

    const stream = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      stream: true,
      temperature: 0.3,
      max_tokens: 600,
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
