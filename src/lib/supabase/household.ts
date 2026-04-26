import { requireSupabaseClient } from './client';

let cachedHouseholdId: string | null = null;

export async function getCurrentHouseholdId() {
  if (cachedHouseholdId) {
    return cachedHouseholdId;
  }

  const supabase = requireSupabaseClient();

  const { data, error } = await supabase.rpc('get_my_household_id');

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('No household found for the current user.');
  }

  cachedHouseholdId = data;
  return cachedHouseholdId;
}

export function clearCachedHouseholdId() {
  cachedHouseholdId = null;
}