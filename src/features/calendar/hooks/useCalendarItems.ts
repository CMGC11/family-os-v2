import { useEffect, useMemo, useState } from 'react';
import {
  getHouseholdId,
  getSelectedDate,
  loadCalendarEvents,
  saveCalendarEvents,
} from '../services/calendarLocalService';
import type { CalendarEvent } from '../types';

export function useCalendarItems() {
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadCalendarEvents());
  const householdId = getHouseholdId();
  const selectedDate = getSelectedDate();

  useEffect(() => {
    saveCalendarEvents(events);
  }, [events]);

  const selectedDayEvents = useMemo(
    () =>
      events
        .filter((event) => event.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [events, selectedDate],
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
        date: selectedDate,
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
    selectedDate,
    addEvent,
    deleteEvent,
  };
}