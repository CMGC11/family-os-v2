import { useEffect, useMemo, useState } from 'react';
import {
  fetchCalendarEvents,
  insertCalendarEvent,
} from '../services/calendarSupabaseService';
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

  async function addEvent(title: string, time = '12:00') {
    const cleanTitle = title.trim();
    const cleanTime = time.trim() || '12:00';

    if (!cleanTitle) return;

    try {
      setErrorMessage('');

      const row = await insertCalendarEvent(cleanTitle, SELECTED_DATE, cleanTime);

      const newEvent: CalendarEvent = {
        id: row.id,
        household_id: row.household_id,
        title: row.title?.trim() || 'Untitled event',
        date: row.date,
        time: row.start_time?.trim() || '12:00',
        created_at: row.created_at ?? new Date().toISOString(),
      };

      setEvents((current) => [...current, newEvent]);
    } catch (error) {
      console.error('Failed to insert calendar event:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add event.');
    }
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