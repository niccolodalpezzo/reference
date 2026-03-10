/**
 * NDP Reference — Mappa territoriale completa Italia
 * Province → Regione → Capoluogo di Regione → Email Responsabile
 *
 * Questa è la fonte di verità per tutta la logica territoriale.
 * Il Responsabile esiste per capoluogo di regione (non per provincia).
 */

export interface TerritoryInfo {
  provincia: string;
  regione: string;
  capoluogo: string;         // capoluogo di regione
  emailResponsabile: string; // email del responsabile assegnato
}

// ─── Responsabili per capoluogo di regione ───────────────────────────────────

export const RESPONSABILI: Record<string, {
  nome: string;
  email: string;
  regione: string;
  capoluogo: string;
}> = {
  'Aosta': {
    nome: 'Lorenzo Bonvin',
    email: 'resp.aosta@ndp.it',
    regione: "Valle d'Aosta",
    capoluogo: 'Aosta',
  },
  'Torino': {
    nome: 'Matteo Gallo',
    email: 'resp.torino@ndp.it',
    regione: 'Piemonte',
    capoluogo: 'Torino',
  },
  'Genova': {
    nome: 'Stefano Ruffini',
    email: 'resp.genova@ndp.it',
    regione: 'Liguria',
    capoluogo: 'Genova',
  },
  'Milano': {
    nome: 'Andrea Moretti',
    email: 'resp.milano@ndp.it',
    regione: 'Lombardia',
    capoluogo: 'Milano',
  },
  'Trento': {
    nome: 'Marco Dallapiccola',
    email: 'resp.trento@ndp.it',
    regione: 'Trentino-Alto Adige',
    capoluogo: 'Trento',
  },
  'Venezia': {
    nome: 'Gianluca Ferraro',
    email: 'resp.venezia@ndp.it',
    regione: 'Veneto',
    capoluogo: 'Venezia',
  },
  'Trieste': {
    nome: 'Roberto Manzini',
    email: 'resp.trieste@ndp.it',
    regione: 'Friuli-Venezia Giulia',
    capoluogo: 'Trieste',
  },
  'Bologna': {
    nome: 'Filippo Gentile',
    email: 'resp.bologna@ndp.it',
    regione: 'Emilia-Romagna',
    capoluogo: 'Bologna',
  },
  'Firenze': {
    nome: 'Leonardo Tosi',
    email: 'resp.firenze@ndp.it',
    regione: 'Toscana',
    capoluogo: 'Firenze',
  },
  'Ancona': {
    nome: 'Simone Bartolini',
    email: 'resp.ancona@ndp.it',
    regione: 'Marche',
    capoluogo: 'Ancona',
  },
  'Perugia': {
    nome: 'Davide Cenci',
    email: 'resp.perugia@ndp.it',
    regione: 'Umbria',
    capoluogo: 'Perugia',
  },
  'Roma': {
    nome: 'Francesco Romano',
    email: 'resp.roma@ndp.it',
    regione: 'Lazio',
    capoluogo: 'Roma',
  },
  "L'Aquila": {
    nome: 'Alessio Palumbo',
    email: 'resp.aquila@ndp.it',
    regione: 'Abruzzo',
    capoluogo: "L'Aquila",
  },
  'Campobasso': {
    nome: 'Antonio Ianiro',
    email: 'resp.campobasso@ndp.it',
    regione: 'Molise',
    capoluogo: 'Campobasso',
  },
  'Napoli': {
    nome: 'Giuseppe Esposito',
    email: 'resp.napoli@ndp.it',
    regione: 'Campania',
    capoluogo: 'Napoli',
  },
  'Potenza': {
    nome: 'Rocco Marrese',
    email: 'resp.potenza@ndp.it',
    regione: 'Basilicata',
    capoluogo: 'Potenza',
  },
  'Bari': {
    nome: 'Nicola Montanaro',
    email: 'resp.bari@ndp.it',
    regione: 'Puglia',
    capoluogo: 'Bari',
  },
  'Catanzaro': {
    nome: 'Vincenzo Russo',
    email: 'resp.catanzaro@ndp.it',
    regione: 'Calabria',
    capoluogo: 'Catanzaro',
  },
  'Palermo': {
    nome: 'Salvatore Amato',
    email: 'resp.palermo@ndp.it',
    regione: 'Sicilia',
    capoluogo: 'Palermo',
  },
  'Cagliari': {
    nome: 'Pietro Melis',
    email: 'resp.cagliari@ndp.it',
    regione: 'Sardegna',
    capoluogo: 'Cagliari',
  },
};

// ─── Tutte le province italiane ───────────────────────────────────────────────

export const PROVINCE_ITALIANE = [
  'Agrigento', 'Alessandria', 'Ancona', 'Aosta', 'Arezzo', 'Ascoli Piceno',
  'Asti', 'Avellino', 'Bari', 'Belluno', 'Benevento', 'Bergamo', 'Biella',
  'Bologna', 'Bolzano', 'Brescia', 'Brindisi', 'Cagliari', 'Caltanissetta',
  'Campobasso', 'Caserta', 'Catania', 'Catanzaro', 'Chieti', 'Como', 'Cosenza',
  'Cremona', 'Crotone', 'Cuneo', 'Enna', 'Fermo', 'Ferrara', 'Firenze',
  'Foggia', 'Frosinone', 'Genova', 'Gorizia', 'Grosseto', 'Imperia', 'Isernia',
  "L'Aquila", 'La Spezia', 'Latina', 'Lecce', 'Lecco', 'Livorno', 'Lodi',
  'Lucca', 'Macerata', 'Mantova', 'Massa-Carrara', 'Matera', 'Messina',
  'Milano', 'Modena', 'Monza e Brianza', 'Napoli', 'Novara', 'Nuoro',
  'Oristano', 'Padova', 'Palermo', 'Parma', 'Pavia', 'Perugia',
  'Pesaro e Urbino', 'Pescara', 'Piacenza', 'Pisa', 'Pistoia', 'Pordenone',
  'Potenza', 'Prato', 'Ragusa', 'Ravenna', 'Reggio Calabria', 'Reggio Emilia',
  'Rieti', 'Rimini', 'Roma', 'Rovigo', 'Salerno', 'Sassari', 'Savona',
  'Siena', 'Siracusa', 'Sondrio', 'Taranto', 'Teramo', 'Terni', 'Torino',
  'Trapani', 'Trento', 'Treviso', 'Trieste', 'Udine', 'Varese', 'Venezia',
  'Vercelli', 'Verona', 'Vibo Valentia', 'Vicenza', 'Viterbo',
] as const;

export type ProvinciaItaliana = (typeof PROVINCE_ITALIANE)[number];

// ─── Mappatura Provincia → Regione → Capoluogo ───────────────────────────────

export const PROVINCIA_TERRITORIO: Record<string, { regione: string; capoluogo: string }> = {
  // Valle d'Aosta
  'Aosta': { regione: "Valle d'Aosta", capoluogo: 'Aosta' },

  // Piemonte
  'Alessandria': { regione: 'Piemonte', capoluogo: 'Torino' },
  'Asti':        { regione: 'Piemonte', capoluogo: 'Torino' },
  'Biella':      { regione: 'Piemonte', capoluogo: 'Torino' },
  'Cuneo':       { regione: 'Piemonte', capoluogo: 'Torino' },
  'Novara':      { regione: 'Piemonte', capoluogo: 'Torino' },
  'Torino':      { regione: 'Piemonte', capoluogo: 'Torino' },
  'Vercelli':    { regione: 'Piemonte', capoluogo: 'Torino' },

  // Liguria
  'Genova':    { regione: 'Liguria', capoluogo: 'Genova' },
  'Imperia':   { regione: 'Liguria', capoluogo: 'Genova' },
  'La Spezia': { regione: 'Liguria', capoluogo: 'Genova' },
  'Savona':    { regione: 'Liguria', capoluogo: 'Genova' },

  // Lombardia
  'Bergamo':        { regione: 'Lombardia', capoluogo: 'Milano' },
  'Brescia':        { regione: 'Lombardia', capoluogo: 'Milano' },
  'Como':           { regione: 'Lombardia', capoluogo: 'Milano' },
  'Cremona':        { regione: 'Lombardia', capoluogo: 'Milano' },
  'Lecco':          { regione: 'Lombardia', capoluogo: 'Milano' },
  'Lodi':           { regione: 'Lombardia', capoluogo: 'Milano' },
  'Mantova':        { regione: 'Lombardia', capoluogo: 'Milano' },
  'Milano':         { regione: 'Lombardia', capoluogo: 'Milano' },
  'Monza e Brianza':{ regione: 'Lombardia', capoluogo: 'Milano' },
  'Pavia':          { regione: 'Lombardia', capoluogo: 'Milano' },
  'Sondrio':        { regione: 'Lombardia', capoluogo: 'Milano' },
  'Varese':         { regione: 'Lombardia', capoluogo: 'Milano' },

  // Trentino-Alto Adige
  'Bolzano': { regione: 'Trentino-Alto Adige', capoluogo: 'Trento' },
  'Trento':  { regione: 'Trentino-Alto Adige', capoluogo: 'Trento' },

  // Veneto
  'Belluno': { regione: 'Veneto', capoluogo: 'Venezia' },
  'Padova':  { regione: 'Veneto', capoluogo: 'Venezia' },
  'Rovigo':  { regione: 'Veneto', capoluogo: 'Venezia' },
  'Treviso': { regione: 'Veneto', capoluogo: 'Venezia' },
  'Venezia': { regione: 'Veneto', capoluogo: 'Venezia' },
  'Verona':  { regione: 'Veneto', capoluogo: 'Venezia' },
  'Vicenza': { regione: 'Veneto', capoluogo: 'Venezia' },

  // Friuli-Venezia Giulia
  'Gorizia':   { regione: 'Friuli-Venezia Giulia', capoluogo: 'Trieste' },
  'Pordenone': { regione: 'Friuli-Venezia Giulia', capoluogo: 'Trieste' },
  'Trieste':   { regione: 'Friuli-Venezia Giulia', capoluogo: 'Trieste' },
  'Udine':     { regione: 'Friuli-Venezia Giulia', capoluogo: 'Trieste' },

  // Emilia-Romagna
  'Bologna':       { regione: 'Emilia-Romagna', capoluogo: 'Bologna' },
  'Ferrara':       { regione: 'Emilia-Romagna', capoluogo: 'Bologna' },
  'Modena':        { regione: 'Emilia-Romagna', capoluogo: 'Bologna' },
  'Parma':         { regione: 'Emilia-Romagna', capoluogo: 'Bologna' },
  'Piacenza':      { regione: 'Emilia-Romagna', capoluogo: 'Bologna' },
  'Ravenna':       { regione: 'Emilia-Romagna', capoluogo: 'Bologna' },
  'Reggio Emilia': { regione: 'Emilia-Romagna', capoluogo: 'Bologna' },
  'Rimini':        { regione: 'Emilia-Romagna', capoluogo: 'Bologna' },

  // Toscana
  'Arezzo':       { regione: 'Toscana', capoluogo: 'Firenze' },
  'Firenze':      { regione: 'Toscana', capoluogo: 'Firenze' },
  'Grosseto':     { regione: 'Toscana', capoluogo: 'Firenze' },
  'Livorno':      { regione: 'Toscana', capoluogo: 'Firenze' },
  'Lucca':        { regione: 'Toscana', capoluogo: 'Firenze' },
  'Massa-Carrara':{ regione: 'Toscana', capoluogo: 'Firenze' },
  'Pisa':         { regione: 'Toscana', capoluogo: 'Firenze' },
  'Pistoia':      { regione: 'Toscana', capoluogo: 'Firenze' },
  'Prato':        { regione: 'Toscana', capoluogo: 'Firenze' },
  'Siena':        { regione: 'Toscana', capoluogo: 'Firenze' },

  // Marche
  'Ancona':          { regione: 'Marche', capoluogo: 'Ancona' },
  'Ascoli Piceno':   { regione: 'Marche', capoluogo: 'Ancona' },
  'Fermo':           { regione: 'Marche', capoluogo: 'Ancona' },
  'Macerata':        { regione: 'Marche', capoluogo: 'Ancona' },
  'Pesaro e Urbino': { regione: 'Marche', capoluogo: 'Ancona' },

  // Umbria
  'Perugia': { regione: 'Umbria', capoluogo: 'Perugia' },
  'Terni':   { regione: 'Umbria', capoluogo: 'Perugia' },

  // Lazio
  'Frosinone': { regione: 'Lazio', capoluogo: 'Roma' },
  'Latina':    { regione: 'Lazio', capoluogo: 'Roma' },
  'Rieti':     { regione: 'Lazio', capoluogo: 'Roma' },
  'Roma':      { regione: 'Lazio', capoluogo: 'Roma' },
  'Viterbo':   { regione: 'Lazio', capoluogo: 'Roma' },

  // Abruzzo
  "L'Aquila": { regione: 'Abruzzo', capoluogo: "L'Aquila" },
  'Chieti':   { regione: 'Abruzzo', capoluogo: "L'Aquila" },
  'Pescara':  { regione: 'Abruzzo', capoluogo: "L'Aquila" },
  'Teramo':   { regione: 'Abruzzo', capoluogo: "L'Aquila" },

  // Molise
  'Campobasso': { regione: 'Molise', capoluogo: 'Campobasso' },
  'Isernia':    { regione: 'Molise', capoluogo: 'Campobasso' },

  // Campania
  'Avellino':  { regione: 'Campania', capoluogo: 'Napoli' },
  'Benevento': { regione: 'Campania', capoluogo: 'Napoli' },
  'Caserta':   { regione: 'Campania', capoluogo: 'Napoli' },
  'Napoli':    { regione: 'Campania', capoluogo: 'Napoli' },
  'Salerno':   { regione: 'Campania', capoluogo: 'Napoli' },

  // Basilicata
  'Matera':  { regione: 'Basilicata', capoluogo: 'Potenza' },
  'Potenza': { regione: 'Basilicata', capoluogo: 'Potenza' },

  // Puglia
  'Bari':     { regione: 'Puglia', capoluogo: 'Bari' },
  'Brindisi': { regione: 'Puglia', capoluogo: 'Bari' },
  'Foggia':   { regione: 'Puglia', capoluogo: 'Bari' },
  'Lecce':    { regione: 'Puglia', capoluogo: 'Bari' },
  'Taranto':  { regione: 'Puglia', capoluogo: 'Bari' },

  // Calabria
  'Catanzaro':      { regione: 'Calabria', capoluogo: 'Catanzaro' },
  'Cosenza':        { regione: 'Calabria', capoluogo: 'Catanzaro' },
  'Crotone':        { regione: 'Calabria', capoluogo: 'Catanzaro' },
  'Reggio Calabria':{ regione: 'Calabria', capoluogo: 'Catanzaro' },
  'Vibo Valentia':  { regione: 'Calabria', capoluogo: 'Catanzaro' },

  // Sicilia
  'Agrigento':   { regione: 'Sicilia', capoluogo: 'Palermo' },
  'Caltanissetta':{ regione: 'Sicilia', capoluogo: 'Palermo' },
  'Catania':     { regione: 'Sicilia', capoluogo: 'Palermo' },
  'Enna':        { regione: 'Sicilia', capoluogo: 'Palermo' },
  'Messina':     { regione: 'Sicilia', capoluogo: 'Palermo' },
  'Palermo':     { regione: 'Sicilia', capoluogo: 'Palermo' },
  'Ragusa':      { regione: 'Sicilia', capoluogo: 'Palermo' },
  'Siracusa':    { regione: 'Sicilia', capoluogo: 'Palermo' },
  'Trapani':     { regione: 'Sicilia', capoluogo: 'Palermo' },

  // Sardegna
  'Cagliari': { regione: 'Sardegna', capoluogo: 'Cagliari' },
  'Nuoro':    { regione: 'Sardegna', capoluogo: 'Cagliari' },
  'Oristano': { regione: 'Sardegna', capoluogo: 'Cagliari' },
  'Sassari':  { regione: 'Sardegna', capoluogo: 'Cagliari' },
};

/**
 * Dato il nome di una provincia, restituisce regione e capoluogo di regione.
 * Fallback su Lombardia/Milano se la provincia non è riconosciuta.
 */
export function getTerritoryForProvincia(provincia: string): {
  regione: string;
  capoluogo: string;
} {
  return PROVINCIA_TERRITORIO[provincia] ?? { regione: 'Lombardia', capoluogo: 'Milano' };
}

/**
 * Dato un capoluogo di regione, restituisce i dati del responsabile assegnato.
 */
export function getResponsabileForCapoluogo(capoluogo: string) {
  return RESPONSABILI[capoluogo] ?? RESPONSABILI['Milano'];
}

/**
 * Dato il nome di una provincia, restituisce il responsabile corretto.
 */
export function getResponsabileForProvincia(provincia: string) {
  const { capoluogo } = getTerritoryForProvincia(provincia);
  return getResponsabileForCapoluogo(capoluogo);
}
