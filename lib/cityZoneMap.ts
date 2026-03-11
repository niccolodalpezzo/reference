// Maps Italian cities to BNI zone names
export const cityZoneMap: Record<string, string> = {
  'Milano': 'Zona Nord',
  'Monza': 'Zona Nord',
  'Bergamo': 'Zona Nord',
  'Brescia': 'Zona Nord',
  'Como': 'Zona Nord',
  'Varese': 'Zona Nord',
  'Lecco': 'Zona Nord',
  'Torino': 'Zona Nord-Ovest',
  'Genova': 'Zona Nord-Ovest',
  'Venezia': 'Zona Nord-Est',
  'Verona': 'Zona Nord-Est',
  'Bologna': 'Zona Centro-Nord',
  'Firenze': 'Zona Centro',
  'Roma': 'Zona Centro-Sud',
  'Napoli': 'Zona Sud',
  'Palermo': 'Zona Sud',
  'Bari': 'Zona Sud',
};

export function getZoneForCity(city: string): string {
  return cityZoneMap[city] ?? 'Zona Nord';
}
