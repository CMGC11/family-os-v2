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
  category: string | null;
  visibility: string | null;
  responsible_id: string | null;
  location: string | null;
  notes: string | null;
  reminder: string | null;
  is_busy: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  recurrence: string | null;
  recurrence_end: string | null;
  recurrence_parent_id: string | null;
};

const EVENT_SELECT = `
  id,
  household_id,
  title,
  date,
  end_date,
  is_multi_day,
  start_time,
  end_time,
  all_day,
  category,
  visibility,
  responsible_id,
  location,
  notes,
  reminder,
  is_busy,
  created_at,
  updated_at,
  recurrence,
  recurrence_end,
  recurrence_parent_id
`;

function getEffectiveEndDate(date: string, endDate?: string | null) {
  return endDate || date;
}

function isMultiDayRange(date: string, endDate?: string | null) {
  return getEffectiveEndDate(date, endDate) > date;
}

function mapRowToEvent(row: EventRow): CalendarEvent {
  const title = row.title?.trim() || 'Untitled event';
  const startTime = row.start_time?.trim() || '12:00';
  const effectiveEndDate = getEffectiveEndDate(row.date, row.end_date);
  const isMultiDay = Boolean(row.is_multi_day) || effectiveEndDate > row.date;

  return {
    id: row.id,
    household_id: row.household_id,
    title,
    date: row.date,
    time: startTime,
    created_at: row.created_at ?? new Date().toISOString(),
    end_date: effectiveEndDate,
    is_multi_day: isMultiDay,
    start_time: row.start_time,
    end_time: row.end_time,
    all_day: Boolean(row.all_day),
    category: row.category,
    visibility: row.visibility,
    responsible_id: row.responsible_id,
    location: row.location,
    notes: row.notes,
    reminder: row.reminder,
    is_busy: row.is_busy,
    updated_at: row.updated_at,
    recurrence: row.recurrence,
    recurrence_end: row.recurrence_end,
    recurrence_parent_id: row.recurrence_parent_id,
  };
}

function normalizeEventInput(input: CalendarEventInput) {
  const title = input.title.trim();
  const date = input.date;
  const endDate = input.end_date || input.date;
  const allDay = Boolean(input.all_day);
  const startTime = allDay ? null : input.start_time?.trim() || '12:00';
  const endTime = allDay ? null : input.end_time?.trim() || null;
  const isMultiDay = isMultiDayRange(date, endDate);

  return {
    title,
    date,
    end_date: endDate,
    is_multi_day: isMultiDay,
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

  return ((data ?? []) as EventRow[]).map(mapRowToEvent);
}

export async function insertCalendarEvent(input: CalendarEventInput): Promise<CalendarEvent> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();
  const normalized = normalizeEventInput(input);

  const { data, error } = await supabase
    .from('events')
    .insert({
      household_id: householdId,
      title: normalized.title,
      date: normalized.date,
      end_date: normalized.end_date,
      is_multi_day: normalized.is_multi_day,
      start_time: normalized.start_time,
      end_time: normalized.end_time,
      all_day: normalized.all_day,
      visibility: 'shared',
      is_busy: false,
    })
    .select(EVENT_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapRowToEvent(data as EventRow);
}

export async function updateCalendarEvent(id: string, input: CalendarEventInput): Promise<CalendarEvent> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();
  const normalized = normalizeEventInput(input);

  const { data, error } = await supabase
    .from('events')
    .update({
      title: normalized.title,
      date: normalized.date,
      end_date: normalized.end_date,
      is_multi_day: normalized.is_multi_day,
      start_time: normalized.start_time,
      end_time: normalized.end_time,
      all_day: normalized.all_day,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('household_id', householdId)
    .select(EVENT_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapRowToEvent(data as EventRow);
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
