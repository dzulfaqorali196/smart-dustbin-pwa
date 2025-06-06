export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bins: {
        Row: {
          id: string
          name: string
          location: string
          max_capacity: number
          current_capacity: number
          status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'
          last_updated: string
          created_at: string
          latitude: number | null
          longitude: number | null
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          location: string
          max_capacity: number
          current_capacity?: number
          status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'
          last_updated?: string
          created_at?: string
          latitude?: number | null
          longitude?: number | null
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          location?: string
          max_capacity?: number
          current_capacity?: number
          status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'
          last_updated?: string
          created_at?: string
          latitude?: number | null
          longitude?: number | null
          user_id?: string | null
        }
      }
      alerts: {
        Row: {
          id: string
          bin_id: string
          alert_type: 'FULL' | 'MAINTENANCE' | 'INACTIVE'
          priority: 'LOW' | 'MEDIUM' | 'HIGH'
          status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          bin_id: string
          alert_type: 'FULL' | 'MAINTENANCE' | 'INACTIVE'
          priority: 'LOW' | 'MEDIUM' | 'HIGH'
          status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          bin_id?: string
          alert_type?: 'FULL' | 'MAINTENANCE' | 'INACTIVE'
          priority?: 'LOW' | 'MEDIUM' | 'HIGH'
          status?: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'
          created_at?: string
          resolved_at?: string | null
        }
      }
      collections: {
        Row: {
          id: string
          bin_id: string
          user_id: string | null
          fill_level_before: number
          notes: string | null
          collected_at: string
        }
        Insert: {
          id?: string
          bin_id: string
          user_id?: string | null
          fill_level_before: number
          notes?: string | null
          collected_at?: string
        }
        Update: {
          id?: string
          bin_id?: string
          user_id?: string | null
          fill_level_before?: number
          notes?: string | null
          collected_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
