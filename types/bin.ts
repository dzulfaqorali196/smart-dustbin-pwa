export interface Bin {
  id: string;
  name: string;
  location: string;
  fillLevel: number; // Persentase 0-100
  isActive: boolean;
  lastUpdated: string; // ISO date string
  latitude: number;
  longitude: number;
} 