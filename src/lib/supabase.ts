import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are set and are not placeholder strings
const hasCredentials =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('SEU_PROJETO') &&
  supabaseAnonKey !== 'sua_anon_key_aqui';

export const supabase = hasCredentials ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Debug log to confirm backend configuration status (humble, developer-facing logging)
if (supabase) {
  console.log('[Supabase] Client initialized successfully. Using remote PostgreSQL backend.');
} else {
  console.log('[Store] Using client-side persistent storage (LocalStorage Engine). Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for real-time cloud sync.');
}
