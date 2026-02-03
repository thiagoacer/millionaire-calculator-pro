import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface User {
  id: string;
  name: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Calculation {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  whatsapp: string;
  age: number;
  current_investment: number;
  monthly_investment: number;
  profile: 'conservative' | 'aggressive';
  years_real: number;
  years_optimized: number;
  scenario: 'iniciante' | 'investidor';
  created_at: string;
}
