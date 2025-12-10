export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string
          car_id: string
          tenant_id: string
          user_id: string | null
          customer_name: string
          customer_phone: string
          customer_email: string | null
          start_date: string
          end_date: string
          total_price_omr: number
          status: 'pending' | 'paid' | 'cancelled' | 'confirmed' | 'completed' | 'quote_sent'
          payment_intent_id: string | null
          delivery_needed: boolean
          delivery_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          car_id: string
          tenant_id: string
          user_id?: string | null
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          start_date: string
          end_date: string
          total_price_omr: number
          status?: 'pending' | 'paid' | 'cancelled' | 'confirmed' | 'completed' | 'quote_sent'
          payment_intent_id?: string | null
          delivery_needed?: boolean
          delivery_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          car_id?: string
          tenant_id?: string
          user_id?: string | null
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          start_date?: string
          end_date?: string
          total_price_omr?: number
          status?: 'pending' | 'paid' | 'cancelled' | 'confirmed' | 'completed' | 'quote_sent'
          payment_intent_id?: string | null
          delivery_needed?: boolean
          delivery_address?: string | null
          created_at?: string
        }
      }
      fleet: {
        Row: {
          id: string
          tenant_id: string
          category: 'car' | 'heavy'
          make: string
          model: string
          year: number
          transmission: string | null
          daily_rate_omr: number
          base_rate: number | null
          images: string[] | null
          is_available: boolean
          is_featured: boolean
          features: string[] | null
          specs: Json | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          category?: 'car' | 'heavy'
          make: string
          model: string
          year: number
          transmission?: string | null
          daily_rate_omr: number
          base_rate?: number | null
          images?: string[] | null
          is_available?: boolean
          is_featured?: boolean
          features?: string[] | null
          specs?: Json | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          category?: 'car' | 'heavy'
          make?: string
          model?: string
          year?: number
          transmission?: string | null
          daily_rate_omr?: number
          base_rate?: number | null
          images?: string[] | null
          is_available?: boolean
          is_featured?: boolean
          features?: string[] | null
          specs?: Json | null
          description?: string | null
          created_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          brand_config: Json | null
          whatsapp_number: string | null
          status: string | null
          cr_number: string | null
          address: string | null
          email: string | null
          logo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          brand_config?: Json | null
          whatsapp_number?: string | null
          status?: string | null
          cr_number?: string | null
          address?: string | null
          email?: string | null
          logo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          brand_config?: Json | null
          whatsapp_number?: string | null
          status?: string | null
          cr_number?: string | null
          address?: string | null
          email?: string | null
          logo_url?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          tenant_id: string | null
          role: 'owner' | 'super_admin' | string
          full_name: string | null
          phone: string | null
          created_at: string
        }
        Insert: {
          id: string
          tenant_id?: string | null
          role?: string
          full_name?: string | null
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string | null
          role?: string
          full_name?: string | null
          phone?: string | null
          created_at?: string
        }
      }
    }
  }
}