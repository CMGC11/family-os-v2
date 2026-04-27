import { requireSupabaseClient } from '../../../lib/supabase/client';
import { getCurrentHouseholdId } from '../../../lib/supabase/household';
import type { Trip } from '../types';

type TripRow = {
  id: string;
  household_id: string;
  title: string;
  destination: string | null;
  start_date: string;
  end_date: string;
  participant_ids: string[] | null;
  accommodation_link: string | null;
  notes: string | null;
  created_at: string | null;
};

function mapRowToTrip(row: TripRow): Trip {
  return {
    id: row.id,
    household_id: row.household_id,
    title: row.title,
    destination: row.destination?.trim() || '',
    start_date: row.start_date,
    end_date: row.end_date,
    participant_ids: row.participant_ids ?? [],
    accommodation_link: row.accommodation_link?.trim() || '',
    notes: row.notes?.trim() || '',
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

export async function fetchTrips(): Promise<Trip[]> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('trips')
    .select(
      'id, household_id, title, destination, start_date, end_date, participant_ids, accommodation_link, notes, created_at',
    )
    .eq('household_id', householdId)
    .order('start_date', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapRowToTrip);
}