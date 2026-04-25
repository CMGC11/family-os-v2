import { useEffect, useMemo, useState } from 'react';
import {
  getHouseholdId,
  loadCalendarEvents,
  saveCalendarEvents,
} from '../../../lib/store/familyStore';
import type { CalendarEvent } from '../types';

const SELECTED_DATE = '2026-04-24';

export function useCalendarItems() {
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadCalendarEvents());
  const householdId = getHouseholdId();

  useEffect(() => {
    saveCalendarEvents(events);
  }, [events]);

  const selectedDayEvents = useMemo(
    () =>
      events
        .filter((event) => event.date === SELECTED_DATE)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [events],
  );

  function addEvent(title: string, time = '12:00') {
    const cleanTitle = title.trim();
    const cleanTime = time.trim() || '12:00';

    if (!cleanTitle) return;

    setEvents((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        household_id: householdId,
        title: cleanTitle,
        date: SELECTED_DATE,
        time: cleanTime,
        created_at: new Date().toISOString(),
      },
    ]);
  }

  function deleteEvent(id: string) {
    setEvents((current) => current.filter((event) => event.id !== id));
  }

  return {
    events,
    selectedDayEvents,
    selectedDate: SELECTED_DATE,
    addEvent,
    deleteEvent,
  };
}