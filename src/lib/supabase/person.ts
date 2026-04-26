import { requireSupabaseClient } from './client';
import { getCurrentHouseholdId } from './household';

let cachedPersonId: string | null = null;

export async function getCurrentPersonId() {
  if (cachedPersonId) {
    return cachedPersonId;
  }

  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error('No authenticated user found.');
  }

  const { data, error } = await supabase
    .from('people')
    .select('id')
    .eq('household_id', householdId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    throw error;
  }

  if (!data?.id) {
    throw new Error('No person record found for current user.');
  }

  cachedPersonId = data.id;
  return cachedPersonId;
}

export function clearCachedPersonId() {
  cachedPersonId = null;
}