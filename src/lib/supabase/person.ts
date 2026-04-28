import { requireSupabaseClient } from './client';
import { getCurrentHouseholdId } from './household';

export type HouseholdPerson = {
  id: string;
  household_id?: string;
  user_id?: string | null;
  label: string;
};

type PersonCandidateRow = {
  id: string;
  household_id?: string | null;
  user_id?: string | null;
  name?: string | null;
  display_name?: string | null;
  full_name?: string | null;
  nickname?: string | null;
};

let cachedPersonId: string | null = null;
let cachedHouseholdPeople: HouseholdPerson[] | null = null;

function getPersonLabel(row: PersonCandidateRow, fallbackIndex: number) {
  return (
    row.name?.trim() ||
    row.display_name?.trim() ||
    row.full_name?.trim() ||
    row.nickname?.trim() ||
    `Person ${fallbackIndex + 1}`
  );
}

function mapPeopleRows(rows: PersonCandidateRow[]): HouseholdPerson[] {
  return rows.map((row, index) => ({
    id: row.id,
    household_id: row.household_id ?? undefined,
    user_id: row.user_id ?? null,
    label: getPersonLabel(row, index),
  }));
}

export async function getCurrentPersonId(): Promise<string> {
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
  return data.id;
}

export async function fetchHouseholdPeople(): Promise<HouseholdPerson[]> {
  if (cachedHouseholdPeople) {
    return cachedHouseholdPeople;
  }

  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const selectCandidates = [
    'id, household_id, user_id, name',
    'id, household_id, user_id, display_name',
    'id, household_id, user_id, full_name',
    'id, household_id, user_id, nickname',
    'id, household_id, user_id',
  ];

  let lastError: unknown = null;

  for (const selectQuery of selectCandidates) {
    const { data, error } = await supabase
      .from('people')
      .select(selectQuery)
      .eq('household_id', householdId);

    if (!error) {
      cachedHouseholdPeople = mapPeopleRows((data ?? []) as unknown as PersonCandidateRow[]);
      return cachedHouseholdPeople;
    }

    lastError = error;
  }

  throw lastError instanceof Error ? lastError : new Error('Failed to load household people.');
}

export async function getCurrentPerson() {
  const [currentPersonId, people] = await Promise.all([getCurrentPersonId(), fetchHouseholdPeople()]);
  return people.find((person) => person.id === currentPersonId) ?? null;
}

export function clearCachedPersonId() {
  cachedPersonId = null;
  cachedHouseholdPeople = null;
}