import { requireSupabaseClient } from './client';

let hasLoggedIn = false;

export async function ensureDevSession() {
  if (hasLoggedIn) return;

  const supabase = requireSupabaseClient();

  const { data } = await supabase.auth.getUser();

  if (data.user) {
    hasLoggedIn = true;
    return;
  }

  await supabase.auth.signInWithPassword({
    email: 'bm_teixeira@hotmail.com',
    password: 'Castelo.11',
  });

  hasLoggedIn = true;
}