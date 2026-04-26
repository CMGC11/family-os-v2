import { requireSupabaseClient } from '../../../lib/supabase/client';
import type { CalendarEvent } from '../types';

const HOUSEHOLD_ID = '11111111-1111-1111-1111-111111111111';

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

  const { data, error } = await supabase
    .from('events')
    .select('id, household_id, title, date, start_time, created_at')
    .eq('household_id', HOUSEHOLD_ID)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapRowToEvent);
}