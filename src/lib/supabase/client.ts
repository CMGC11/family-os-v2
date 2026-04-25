import { createClient } from '@supabase/supabase-js';
import { env } from '../../core/config/env';

export const supabase = env.hasSupabaseConfig
  ? createClient(env.supabaseUrl, env.supabasePublishableKey)
  : null;

export function requireSupabaseClient() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local.',
    );
  }

  return supabase;
}