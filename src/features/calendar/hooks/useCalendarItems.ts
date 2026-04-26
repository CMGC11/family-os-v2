import { useEffect, useMemo, useState } from 'react';
import { fetchCalendarEvents } from '../services/calendarSupabaseService';
import type { CalendarEvent } from '../types';

const SELECTED_DATE = '2026-04-24';

export function useCalendarItems() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const nextEvents = await fetchCalendarEvents();

        if (!cancelled) {
          setEvents(nextEvents);
        }
      } catch (error) {
        console.error('Failed to load calendar events:', error);

        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : 'Failed to load calendar events.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      cancelled = true;
    };
  }, []);

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
        household_id: '11111111-1111-1111-1111-111111111111',
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
    isLoading,
    errorMessage,
    addEvent,
    deleteEvent,
  };
}