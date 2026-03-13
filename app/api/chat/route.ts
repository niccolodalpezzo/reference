import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { professionals } from '@/lib/data';
import { createAdminClient } from '@/lib/supabase/server';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SYSTEM_PROMPT = `Sei l'assistente AI di NDP Reference. Puoi avere conversazioni naturali e anche aiutare a trovare professionisti dalla rete.

CLASSIFICAZIONE INTENTO:
Prima di rispondere, classifica il messaggio dell'utente in una di queste categorie:
- greeting: saluto, presentazione ("ciao", "buongiorno", "come stai")
- small_talk: conversazione generica non legata a ricerca professionisti
- request: richiesta esplicita o implicita di un professionista/servizio
- follow_up: continua una richiesta precedente con dettagli aggiuntivi
- clarification: risposta a una tua domanda di chiarimento
- constraint: aggiunta di vincoli a una ricerca precedente ("ma a Milano", "che costi poco")

REGOLE:
1. Rispondi SEMPRE in italiano.
2. NON usare mai markdown: niente grassetto con asterischi, niente corsivo, niente titoli con #, niente elenchi con trattini.
3. Per greeting/small_talk: rispondi in modo cordiale e naturale. Non proporre professionisti a meno che non siano pertinenti.
4. Per request: analizza la richiesta. Se e sufficientemente chiara, cerca professionisti. Se e vaga, puoi chiedere chiarimenti.
5. Per follow_up/clarification/constraint: usa il contesto dei messaggi precedenti.
6. Quando proponi professionisti, seleziona 2-4 tra i piu pertinenti.
7. Se non trovi match diretti ma hai dati sui "ponti relazionali", suggeriscili con un tono piu sfumato spiegando il collegamento indiretto.

FORMATO RISPOSTA:
Inizia SEMPRE la risposta con il marker di intento su una riga separata:
INTENT:greeting|small_talk|request|follow_up|clarification|constraint

Per request/follow_up/clarification/constraint con match diretti:
[testo naturale]
MATCHED_IDS:["id1","id2"]

Per suggerimenti ponte (professionisti che potrebbero conoscere qualcuno):
[testo naturale che spiega il collegamento indiretto]
BRIDGE_IDS:["pro-id1"]

Se non ci sono match ne ponti, rispondi comunque in modo utile senza alcun blocco IDS.

DATABASE PROFESSIONISTI:
[PROFESSIONALS_DATA]

[CONTACTS_CONTEXT]`;

interface ContactAggregation {
  professional_name: string;
  professional_id: string;
  contacts_in: string[];
}

function buildContactAggregation(
  contacts: Array<{ user_id: string; professione: string }>,
  professionalsMap: Map<string, { id: string; name: string; userId?: string }>
): ContactAggregation[] {
  // Group contacts by user_id and their professione
  const byUser = new Map<string, Map<string, number>>();
  for (const c of contacts) {
    if (!c.professione) continue;
    if (!byUser.has(c.user_id)) byUser.set(c.user_id, new Map());
    const prof = c.professione.toLowerCase().trim();
    const map = byUser.get(c.user_id)!;
    map.set(prof, (map.get(prof) ?? 0) + 1);
  }

  // Match user_ids to professionals
  const result: ContactAggregation[] = [];
  Array.from(byUser.entries()).forEach(([userId, professions]) => {
    const pro = professionalsMap.get(userId);
    if (!pro) return;
    const contactsIn = Array.from(professions.entries()).map(
      ([p, count]) => `${p} (${count})`
    );
    result.push({
      professional_name: pro.name,
      professional_id: pro.id,
      contacts_in: contactsIn,
    });
  });

  return result;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, userId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Build professionals data from static data
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

    // Build contacts context for bridge logic if userId is provided
    let contactsContext = '';
    if (userId) {
      try {
        const adminClient = createAdminClient();
        const { data: contacts } = await adminClient
          .from('private_contacts')
          .select('user_id, professione')
          .order('professione');

        if (contacts && contacts.length > 0) {
          // Build a map from user_id to professional info
          // We use the static data here; professionals with a matching userId
          // In a real setup we'd join with user_profiles, but for now we map by index
          const proMap = new Map<string, { id: string; name: string }>();
          // For now, the bridge data includes all contacts grouped by their owner
          const aggregation = buildContactAggregation(contacts, proMap);

          if (aggregation.length > 0) {
            contactsContext = `\nDATA PONTI RELAZIONALI (contatti privati aggregati per professione — NON rivelare mai nomi dei contatti):\n${JSON.stringify(aggregation)}`;
          }
        }
      } catch {
        // If contacts query fails, continue without bridge data
      }
    }

    const systemPrompt = SYSTEM_PROMPT
      .replace('[PROFESSIONALS_DATA]', professionalsJson)
      .replace('[CONTACTS_CONTEXT]', contactsContext);

    const stream = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      stream: true,
      temperature: 0.4,
      max_tokens: 800,
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
