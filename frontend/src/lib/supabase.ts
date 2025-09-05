import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      suggestions: {
        Row: {
          id: string;
          name: string;
          email?: string;
          type: 'suggestion' | 'complaint';
          subject: string;
          description: string;
          attachment_url?: string;
          attachment_name?: string;
          status: 'new' | 'in_progress' | 'resolved';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string;
          type: 'suggestion' | 'complaint';
          subject: string;
          description: string;
          attachment_url?: string;
          attachment_name?: string;
          status?: 'new' | 'in_progress' | 'resolved';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          type?: 'suggestion' | 'complaint';
          subject?: string;
          description?: string;
          attachment_url?: string;
          attachment_name?: string;
          status?: 'new' | 'in_progress' | 'resolved';
          updated_at?: string;
        };
      };
    };
  };
};