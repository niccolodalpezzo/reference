import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { EventRow } from '@/lib/db/events';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SYSTEM_PROMPT = `Sei un filtro eventi per una piattaforma professionale italiana.
Ricevi una query in linguaggio naturale e una lista di eventi.
Restituisci SOLO un JSON valido (niente testo aggiuntivo) con questa struttura:
{ "matchedIds": ["id1","id2",...], "parsedFilters": { "city": "...", "region": "...", "dateHint": "..." } }
Regole:
- matchedIds: IDs degli eventi che corrispondono alla query, ordinati per rilevanza
- Se nessun evento corrisponde, matchedIds è []
- parsedFilters: estrai città, regione, indicazione temporale dalla query (null se non presenti)
- Rispondi SOLO con il JSON, senza markdown`;

function clientSideFilter(query: string, events: EventRow[]): string[] {
  const q = query.toLowerCase();
  return events
    .filter((e) =>
      e.titolo.toLowerCase().includes(q) ||
      e.citta.toLowerCase().includes(q) ||
      (e.regione ?? '').toLowerCase().includes(q)
    )
    .map((e) => e.id);
}

export async function POST(req: NextRequest) {
  try {
    const { query, events } = (await req.json()) as { query: string; events: EventRow[] };

    if (!query || !Array.isArray(events)) {
      return NextResponse.json({ matchedIds: [], parsedFilters: {} }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        matchedIds: clientSideFilter(query, events),
        parsedFilters: {},
      });
    }

    // Build compact summary — avoid sending full descriptions to save tokens
    const summary = events.map((e) => ({
      id: e.id,
      titolo: e.titolo,
      citta: e.citta,
      regione: e.regione ?? '',
      data_evento: e.data_evento,
    }));

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Query: "${query}"\n\nEventi disponibili:\n${JSON.stringify(summary, null, 2)}`,
        },
      ],
      temperature: 0,
      max_tokens: 500,
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);

    return NextResponse.json({
      matchedIds: Array.isArray(parsed.matchedIds) ? parsed.matchedIds : [],
      parsedFilters: parsed.parsedFilters ?? {},
    });
  } catch {
    // Fallback to client-side filter on any error
    try {
      const { query, events } = (await new Response(req.body).json()) as { query: string; events: EventRow[] };
      return NextResponse.json({ matchedIds: clientSideFilter(query, events), parsedFilters: {} });
    } catch {
      return NextResponse.json({ matchedIds: [], parsedFilters: {} });
    }
  }
}
