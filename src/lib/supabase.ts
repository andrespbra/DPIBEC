import { createClient } from '@supabase/supabase-js';

// Helper function to sanitize environment variables and remove potential wrapping quotes/whitespace
function sanitizeEnv(value: any): string {
  if (!value) return '';
  // Convert to string and trim whitespace
  let clean = String(value).trim();
  // Remove wrapping double quotes if present
  if (clean.startsWith('"') && clean.endsWith('"')) {
    clean = clean.slice(1, -1).trim();
  }
  // Remove wrapping single quotes if present
  if (clean.startsWith("'") && clean.endsWith("'")) {
    clean = clean.slice(1, -1).trim();
  }
  return clean;
}

const rawSupabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const rawSupabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

let supabaseUrl = sanitizeEnv(rawSupabaseUrl);
let supabaseAnonKey = sanitizeEnv(rawSupabaseAnonKey);

// Normalize URL: remove trailing slash or /rest/v1 if the user inadvertently appended them
if (supabaseUrl) {
  // Remove trailing slashes
  while (supabaseUrl.endsWith('/')) {
    supabaseUrl = supabaseUrl.slice(0, -1);
  }
  // Remove trailing /rest/v1
  if (supabaseUrl.endsWith('/rest/v1')) {
    supabaseUrl = supabaseUrl.slice(0, -8);
  }
  // If the user forgot 'https://', prepend it
  if (supabaseUrl && !supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    supabaseUrl = 'https://' + supabaseUrl;
  }
}

// Check if credentials are set and are not placeholder strings
const hasCredentials =
  supabaseUrl &&
  supabaseUrl.length > 0 &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('SEU_PROJETO') &&
  supabaseAnonKey &&
  supabaseAnonKey.length > 0 &&
  supabaseAnonKey !== 'sua_anon_key_aqui' &&
  supabaseAnonKey !== 'your-anon-key';

export const supabase = hasCredentials ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Debug log to confirm backend configuration status (humble, developer-facing logging)
if (supabase) {
  console.log(`[Supabase] Client initialized successfully. URL: ${supabaseUrl}`);
} else {
  console.log('[Store] Using client-side persistent storage (LocalStorage Engine). Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for real-time cloud sync.');
}
