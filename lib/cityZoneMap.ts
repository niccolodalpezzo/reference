// Maps Italian cities to BNI zone names
// In demo, all cities map to Luca Ferrari's zone
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

export const DEMO_ZONE_MANAGER_ID = 'u2';
export const DEMO_ZONE_MANAGER_NAME = 'Luca Ferrari';

export function getZoneForCity(city: string): string {
  return cityZoneMap[city] ?? 'Zona Nord';
}
