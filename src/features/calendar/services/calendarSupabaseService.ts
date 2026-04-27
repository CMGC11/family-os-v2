import { requireSupabaseClient } from '../../../lib/supabase/client';
import { getCurrentHouseholdId } from '../../../lib/supabase/household';
import type { CalendarEvent } from '../types';

type EventRow = {
  id: string;
  household_id: string;
  title: string | null;
  date: string;
  start_time: string | null;
  created_at: string | null;
};

function mapRowToEvent(row: EventRow): CalendarEvent {
  return {
    id: row.id,
    household_id: row.household_id,
    title: row.title?.trim() || 'Untitled event',
    date: row.date,
    time: row.start_time?.trim() || '12:00',
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('events')
    .select('id, household_id, title, date, start_time, created_at')
    .eq('household_id', householdId)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapRowToEvent);
}

export async function insertCalendarEvent(title: string, date: string, time: string) {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('events')
    .insert({
      household_id: householdId,
      title,
      date,
      start_time: time,
      all_day: false,
      visibility: 'shared',
      is_busy: false,
    })
    .select('id, household_id, title, date, start_time, created_at')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateCalendarEvent(id: string, title: string, time: string) {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('events')
    .update({
      title,
      start_time: time,
    })
    .eq('id', id)
    .eq('household_id', householdId)
    .select('id, household_id, title, date, start_time, created_at')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
    .eq('household_id', householdId);

  if (error) {
    throw error;
  }
}