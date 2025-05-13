export enum BinStatus {
  EMPTY = 'empty',
  FILLING = 'filling',
  ALMOST_FULL = 'almost_full',
  FULL = 'full'
}

export enum AlertType {
  CAPACITY_WARNING = 'capacity_warning',
  CAPACITY_CRITICAL = 'capacity_critical',
  MALFUNCTION = 'malfunction'
}

export enum AlertPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum AlertStatus {
  PENDING = 'pending',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved'
}

export interface Bin {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  max_capacity: number;
  current_capacity: number;
  status: BinStatus;
  last_updated: string;
  created_at: string;
}

export interface Alert {
  id: string;
  bin_id: string;
  alert_type: AlertType;
  priority: AlertPriority;
  status: AlertStatus;
  created_at: string;
  resolved_at?: string;
  bin?: {
    name: string;
    latitude: number;
    longitude: number;
  };
}

export interface Collection {
  id: string;
  bin_id: string;
  user_id: string;
  fill_level_before: number;
  notes?: string;
  collected_at: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'worker';
  created_at: string;
} 