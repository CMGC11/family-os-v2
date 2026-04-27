import { requireSupabaseClient } from '../../../lib/supabase/client';
import { getCurrentHouseholdId } from '../../../lib/supabase/household';
import type { PackingItem, PrepItem, Trip } from '../types';

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

type PackingItemRow = {
  id: string;
  trip_id: string | null;
  name: string;
  assigned_to: string | null;
  is_packed: boolean | null;
  created_at: string | null;
};

type PrepItemRow = {
  id: string;
  trip_id: string;
  household_id: string;
  name: string;
  is_done: boolean;
  created_by: string | null;
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

function mapRowToPackingItem(row: PackingItemRow): PackingItem {
  return {
    id: row.id,
    trip_id: row.trip_id ?? '',
    name: row.name?.trim() || 'Untitled item',
    assigned_to: row.assigned_to ?? '',
    is_packed: Boolean(row.is_packed),
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

function mapRowToPrepItem(row: PrepItemRow): PrepItem {
  return {
    id: row.id,
    trip_id: row.trip_id,
    household_id: row.household_id,
    name: row.name?.trim() || 'Untitled task',
    is_done: row.is_done,
    created_by: row.created_by ?? '',
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

export async function insertTrip(input: {
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
}) {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('trips')
    .insert({
      household_id: householdId,
      title: input.title,
      destination: input.destination,
      start_date: input.start_date,
      end_date: input.end_date,
      participant_ids: [],
      accommodation_link: '',
      notes: '',
    })
    .select(
      'id, household_id, title, destination, start_date, end_date, participant_ids, accommodation_link, notes, created_at',
    )
    .single();

  if (error) {
    throw error;
  }

  return mapRowToTrip(data);
}

export async function deleteTrip(id: string): Promise<void> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', id)
    .eq('household_id', householdId);

  if (error) {
    throw error;
  }
}

export async function fetchPackingItems(tripId: string): Promise<PackingItem[]> {
  const supabase = requireSupabaseClient();

  const { data, error } = await supabase
    .from('packing_items')
    .select('id, trip_id, name, assigned_to, is_packed, created_at')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapRowToPackingItem);
}

export async function insertPackingItem(input: { tripId: string; name: string }): Promise<PackingItem> {
  const supabase = requireSupabaseClient();

  const { data, error } = await supabase
    .from('packing_items')
    .insert({
      trip_id: input.tripId,
      name: input.name,
      is_packed: false,
    })
    .select('id, trip_id, name, assigned_to, is_packed, created_at')
    .single();

  if (error) {
    throw error;
  }

  return mapRowToPackingItem(data);
}

export async function updatePackingItemPacked(id: string, isPacked: boolean): Promise<void> {
  const supabase = requireSupabaseClient();

  const { error } = await supabase
    .from('packing_items')
    .update({ is_packed: isPacked })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

export async function deletePackingItem(id: string): Promise<void> {
  const supabase = requireSupabaseClient();

  const { error } = await supabase.from('packing_items').delete().eq('id', id);

  if (error) {
    throw error;
  }
}

export async function fetchPrepItems(tripId: string): Promise<PrepItem[]> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('prep_items')
    .select('id, trip_id, household_id, name, is_done, created_by, created_at')
    .eq('household_id', householdId)
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapRowToPrepItem);
}

export async function insertPrepItem(input: { tripId: string; name: string }): Promise<PrepItem> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('prep_items')
    .insert({
      trip_id: input.tripId,
      household_id: householdId,
      name: input.name,
      is_done: false,
    })
    .select('id, trip_id, household_id, name, is_done, created_by, created_at')
    .single();

  if (error) {
    throw error;
  }

  return mapRowToPrepItem(data);
}

export async function updatePrepItemDone(id: string, isDone: boolean): Promise<void> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { error } = await supabase
    .from('prep_items')
    .update({ is_done: isDone })
    .eq('id', id)
    .eq('household_id', householdId);

  if (error) {
    throw error;
  }
}

export async function deletePrepItem(id: string): Promise<void> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { error } = await supabase.from('prep_items').delete().eq('id', id).eq('household_id', householdId);

  if (error) {
    throw error;
  }
}
