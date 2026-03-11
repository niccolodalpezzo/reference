'use client';

import type { EventRow } from '@/lib/db/events';

// City coordinates for SVG map positioning (percentage-based on Italy outline)
const CITY_POSITIONS: Record<string, { x: number; y: number }> = {
  'Milano':   { x: 36, y: 16 },
  'Torino':   { x: 22, y: 20 },
  'Genova':   { x: 28, y: 28 },
  'Venezia':  { x: 52, y: 20 },
  'Trieste':  { x: 60, y: 20 },
  'Trento':   { x: 46, y: 14 },
  'Bergamo':  { x: 38, y: 17 },
  'Brescia':  { x: 41, y: 18 },
  'Verona':   { x: 46, y: 20 },
  'Padova':   { x: 51, y: 21 },
  'Bologna':  { x: 50, y: 32 },
  'Firenze':  { x: 48, y: 43 },
  'Ancona':   { x: 60, y: 43 },
  'Perugia':  { x: 54, y: 48 },
  'Roma':     { x: 54, y: 59 },
  'Napoli':   { x: 63, y: 72 },
  'Bari':     { x: 76, y: 67 },
  'Catanzaro':{ x: 73, y: 83 },
  'Palermo':  { x: 52, y: 92 },
  'Catania':  { x: 66, y: 94 },
  'Cagliari': { x: 28, y: 82 },
};

interface EventMapProps {
  events: EventRow[];
  highlightedEventId: string | null;
  onPinClick: (eventId: string) => void;
}

export default function EventMap({ events, highlightedEventId, onPinClick }: EventMapProps) {
  // Group events by city to avoid overlapping pins
  const cityEvents: Record<string, EventRow[]> = {};
  for (const event of events) {
    const city = event.citta;
    if (!cityEvents[city]) cityEvents[city] = [];
    cityEvents[city].push(event);
  }

  const cities = Object.keys(cityEvents).filter((c) => CITY_POSITIONS[c]);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 overflow-hidden">
      {/* Background grid */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="events-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(34,0,204,0.05)" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#events-grid)" />

        {/* Italy silhouette (approximate ellipse) */}
        <ellipse cx="50" cy="55" rx="23" ry="43" fill="rgba(34,0,204,0.03)" stroke="rgba(34,0,204,0.08)" strokeWidth="0.5" />
        {/* Sicily */}
        <ellipse cx="55" cy="92" rx="9" ry="4" fill="rgba(34,0,204,0.02)" stroke="rgba(34,0,204,0.06)" strokeWidth="0.3" />
        {/* Sardinia */}
        <ellipse cx="28" cy="80" rx="5" ry="8" fill="rgba(34,0,204,0.02)" stroke="rgba(34,0,204,0.06)" strokeWidth="0.3" />

        {/* City pins */}
        {cities.map((city) => {
          const pos = CITY_POSITIONS[city];
          const cityEvs = cityEvents[city];
          const isHighlighted = cityEvs.some((e) => e.id === highlightedEventId);
          const count = cityEvs.length;

          return (
            <g
              key={city}
              style={{ cursor: 'pointer' }}
              onClick={() => onPinClick(cityEvs[0].id)}
            >
              {isHighlighted && (
                <circle cx={pos.x} cy={pos.y} r="5" fill="rgba(201,168,76,0.25)" className="animate-ping" />
              )}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isHighlighted ? 3.5 : 2.8}
                fill={isHighlighted ? '#C9A84C' : '#2200CC'}
                stroke="white"
                strokeWidth="1"
              />
              {count > 1 && (
                <text
                  x={pos.x}
                  y={pos.y + 0.6}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="2.2"
                  fill="white"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {count}
                </text>
              )}
              <text
                x={pos.x + 4}
                y={pos.y + 1}
                fontSize="3.2"
                fill="#374151"
                fontFamily="sans-serif"
              >
                {city}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 text-xs shadow-sm border border-ndp-border space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-ndp-blue border-2 border-white shadow-sm" />
          <span className="text-ndp-text">Evento attivo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-ndp-gold border-2 border-white shadow-sm" />
          <span className="text-ndp-text">Selezionato</span>
        </div>
      </div>

      {/* Event count badge */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-xs font-bold text-ndp-blue border border-ndp-border shadow-sm">
        {events.length} eventi
      </div>

      {/* No events placeholder */}
      {events.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/80 rounded-2xl px-6 py-4 text-center shadow-sm border border-ndp-border">
            <p className="text-ndp-muted text-sm">Nessun evento trovato</p>
          </div>
        </div>
      )}
    </div>
  );
}
