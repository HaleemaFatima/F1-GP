import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          name: string;
          date: string;
          venue: string;
          image_url: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          date: string;
          venue: string;
          image_url?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          date?: string;
          venue?: string;
          image_url?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      seats: {
        Row: {
          id: string;
          section: string;
          row: string;
          number: string;
          price: number;
          is_accessible: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          section: string;
          row: string;
          number: string;
          price: number;
          is_accessible?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          section?: string;
          row?: string;
          number?: string;
          price?: number;
          is_accessible?: boolean;
          created_at?: string;
        };
      };
      seat_inventory: {
        Row: {
          id: string;
          event_id: string;
          seat_id: string;
          status: 'AVAILABLE' | 'HELD' | 'SOLD';
          hold_id: string | null;
          hold_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          seat_id: string;
          status?: 'AVAILABLE' | 'HELD' | 'SOLD';
          hold_id?: string | null;
          hold_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          seat_id?: string;
          status?: 'AVAILABLE' | 'HELD' | 'SOLD';
          hold_id?: string | null;
          hold_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      holds: {
        Row: {
          id: string;
          event_id: string;
          seat_ids: string[];
          user_id: string;
          expire_at: string;
          status: 'ACTIVE' | 'EXPIRED' | 'CONFIRMED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          seat_ids: string[];
          user_id: string;
          expire_at: string;
          status?: 'ACTIVE' | 'EXPIRED' | 'CONFIRMED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          seat_ids?: string[];
          user_id?: string;
          expire_at?: string;
          status?: 'ACTIVE' | 'EXPIRED' | 'CONFIRMED';
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          seat_ids: string[];
          amount: number;
          status: 'PENDING' | 'PAID' | 'REFUNDED';
          payment_request_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          seat_ids: string[];
          amount: number;
          status?: 'PENDING' | 'PAID' | 'REFUNDED';
          payment_request_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string;
          seat_ids?: string[];
          amount?: number;
          status?: 'PENDING' | 'PAID' | 'REFUNDED';
          payment_request_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          event_id: string;
          seat_id: string;
          user_id: string;
          qr_code: string;
          order_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          seat_id: string;
          user_id: string;
          qr_code: string;
          order_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          seat_id?: string;
          user_id?: string;
          qr_code?: string;
          order_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}