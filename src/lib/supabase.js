import { createClient } from '@supabase/supabase-js';

// Reads credentials from Environment Variables (.env locally or Vercel Environment Variables live)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client instance (or null fallback if env vars not provided yet)
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
