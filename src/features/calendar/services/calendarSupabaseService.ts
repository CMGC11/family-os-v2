import { requireSupabaseClient } from '../../../lib/supabase/client';
import { getCurrentHouseholdId } from '../../../lib/supabase/household';
import type { CalendarEvent, CalendarEventInput } from '../types';

type EventRow = {
  id: string;
  household_id: string;
  title: string | null;
  date: string;
  end_date: string | null;
  is_multi_day: boolean | null;
  start_time: string | null;
  end_time: string | null;
  all_day: boolean | null;
  created_at: string | null;
};

const EVENT_SELECT =
  'id, household_id, title, date, end_date, is_multi_day, start_time, end_time, all_day, created_at';

function getCleanEndDate(date: string, endDate?: string | null) {
  return endDate?.trim() || date;
}

function isMultiDay(date: string, endDate: string) {
  return endDate > date;
}

function mapRowToEvent(row: EventRow): CalendarEvent {
  const date = row.date;
  const endDate = getCleanEndDate(date, row.end_date);
  const allDay = Boolean(row.all_day);
  const startTime = row.start_time?.trim() || '12:00';

  return {
    id: row.id,
    household_id: row.household_id,
    title: row.title?.trim() || 'Untitled event',
    date,
    end_date: endDate,
    is_multi_day: Boolean(row.is_multi_day) || isMultiDay(date, endDate),
    time: allDay ? 'All day' : startTime,
    start_time: startTime,
    end_time: row.end_time?.trim() || null,
    all_day: allDay,
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

function toDatabasePayload(input: CalendarEventInput) {
  const cleanTitle = input.title.trim();
  const date = input.date;
  const endDate = getCleanEndDate(date, input.end_date);
  const allDay = Boolean(input.all_day);
  const startTime = allDay ? null : input.start_time?.trim() || '12:00';
  const endTime = allDay ? null : input.end_time?.trim() || null;

  return {
    title: cleanTitle,
    date,
    end_date: endDate,
    is_multi_day: isMultiDay(date, endDate),
    start_time: startTime,
    end_time: endTime,
    all_day: allDay,
  };
}

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('events')
    .select(EVENT_SELECT)
    .eq('household_id', householdId)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as EventRow[]).map(mapRowToEvent);
}

export async function insertCalendarEvent(input: CalendarEventInput): Promise<CalendarEvent> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('events')
    .insert({
      household_id: householdId,
      ...toDatabasePayload(input),
      visibility: 'shared',
      is_busy: false,
    })
    .select(EVENT_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapRowToEvent(data as unknown as EventRow);
}

export async function updateCalendarEvent(id: string, input: CalendarEventInput): Promise<CalendarEvent> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('events')
    .update(toDatabasePayload(input))
    .eq('id', id)
    .eq('household_id', householdId)
    .select(EVENT_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapRowToEvent(data as unknown as EventRow);
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
