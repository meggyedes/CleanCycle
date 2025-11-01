export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'user' | 'manager' | 'admin'
export type MachineType = 'washer' | 'dryer'
export type MachineStatus = 'free' | 'running' | 'booked' | 'maintenance' | 'broken'
export type SessionStatus = 'active' | 'finished' | 'cancelled'
export type NotificationType = 'reminder' | 'expired' | 'forgotten' | 'system'
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type NotificationChannel = 'email' | 'push' | 'in_app'
export type MaintenanceType = 'preventive' | 'corrective' | 'inspection'
export type ErrorSeverity = 'info' | 'warning' | 'critical'
export type NotificationLogStatus = 'pending' | 'sent' | 'failed' | 'read'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          first_name: string | null
          last_name: string | null
          apartment_number: string | null
          phone: string | null
          role: UserRole
          remember_me: boolean
          last_login: string | null
          profile_updated_at: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          first_name?: string | null
          last_name?: string | null
          apartment_number?: string | null
          phone?: string | null
          role?: UserRole
          remember_me?: boolean
          last_login?: string | null
          profile_updated_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          first_name?: string | null
          last_name?: string | null
          apartment_number?: string | null
          phone?: string | null
          role?: UserRole
          remember_me?: boolean
          last_login?: string | null
          profile_updated_at?: string | null
          created_at?: string
        }
      }
      rooms: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      machines: {
        Row: {
          id: number
          room_id: number
          name: string
          type: MachineType
          status: MachineStatus
          default_duration: number
          capacity_kg: number | null
          error_code: string | null
          error_message: string | null
          last_maintenance: string | null
          created_at: string
        }
        Insert: {
          id?: number
          room_id: number
          name: string
          type: MachineType
          status?: MachineStatus
          default_duration?: number
          capacity_kg?: number | null
          error_code?: string | null
          error_message?: string | null
          last_maintenance?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          room_id?: number
          name?: string
          type?: MachineType
          status?: MachineStatus
          default_duration?: number
          capacity_kg?: number | null
          error_code?: string | null
          error_message?: string | null
          last_maintenance?: string | null
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: number
          user_id: string
          machine_id: number
          start_time: string
          end_time: string
          actual_end: string | null
          status: SessionStatus
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          machine_id: number
          start_time?: string
          end_time: string
          actual_end?: string | null
          status?: SessionStatus
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          machine_id?: number
          start_time?: string
          end_time?: string
          actual_end?: string | null
          status?: SessionStatus
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: number
          user_id: string
          type: NotificationType
          message: string
          sent_at: string
        }
        Insert: {
          id?: number
          user_id: string
          type: NotificationType
          message: string
          sent_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          type?: NotificationType
          message?: string
          sent_at?: string
        }
      }
      logs: {
        Row: {
          id: number
          user_id: string | null
          machine_id: number | null
          action: string
          timestamp: string
          details: Json | null
        }
        Insert: {
          id?: number
          user_id?: string | null
          machine_id?: number | null
          action: string
          timestamp?: string
          details?: Json | null
        }
        Update: {
          id?: number
          user_id?: string | null
          machine_id?: number | null
          action?: string
          timestamp?: string
          details?: Json | null
        }
      }
      user_preferences: {
        Row: {
          id: number
          user_id: string
          phone: string | null
          language: string
          email_notifications: boolean
          push_notifications: boolean
          in_app_notifications: boolean
          notification_reminder_minutes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          phone?: string | null
          language?: string
          email_notifications?: boolean
          push_notifications?: boolean
          in_app_notifications?: boolean
          notification_reminder_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          phone?: string | null
          language?: string
          email_notifications?: boolean
          push_notifications?: boolean
          in_app_notifications?: boolean
          notification_reminder_minutes?: number
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: number
          user_id: string
          machine_id: number
          start_time: string
          end_time: string
          status: ReservationStatus
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          machine_id: number
          start_time: string
          end_time: string
          status?: ReservationStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          machine_id?: number
          start_time?: string
          end_time?: string
          status?: ReservationStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      machine_errors: {
        Row: {
          id: number
          machine_id: number
          error_code: string
          error_message: string
          severity: ErrorSeverity
          resolved: boolean
          resolved_at: string | null
          created_at: string
        }
        Insert: {
          id?: number
          machine_id: number
          error_code: string
          error_message: string
          severity?: ErrorSeverity
          resolved?: boolean
          resolved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          machine_id?: number
          error_code?: string
          error_message?: string
          severity?: ErrorSeverity
          resolved?: boolean
          resolved_at?: string | null
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: number
          user_id: string | null
          machine_id: number | null
          session_id: number | null
          action: string
          action_type: string
          details: Json | null
          timestamp: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          machine_id?: number | null
          session_id?: number | null
          action: string
          action_type: string
          details?: Json | null
          timestamp?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          machine_id?: number | null
          session_id?: number | null
          action?: string
          action_type?: string
          details?: Json | null
          timestamp?: string
        }
      }
      notification_logs: {
        Row: {
          id: number
          user_id: string
          notification_id: number | null
          channel: NotificationChannel
          message: string
          status: NotificationLogStatus
          error_message: string | null
          sent_at: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          notification_id?: number | null
          channel: NotificationChannel
          message: string
          status?: NotificationLogStatus
          error_message?: string | null
          sent_at?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          notification_id?: number | null
          channel?: NotificationChannel
          message?: string
          status?: NotificationLogStatus
          error_message?: string | null
          sent_at?: string | null
          read_at?: string | null
          created_at?: string
        }
      }
      maintenance_history: {
        Row: {
          id: number
          machine_id: number
          maintenance_type: MaintenanceType
          description: string
          performed_by: string | null
          start_time: string
          end_time: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: number
          machine_id: number
          maintenance_type: MaintenanceType
          description: string
          performed_by?: string | null
          start_time: string
          end_time?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          machine_id?: number
          maintenance_type?: MaintenanceType
          description?: string
          performed_by?: string | null
          start_time?: string
          end_time?: string | null
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}

