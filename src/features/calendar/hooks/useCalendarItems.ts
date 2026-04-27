import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deleteCalendarEvent,
  fetchCalendarEvents,
  insertCalendarEvent,
} from '../services/calendarSupabaseService';
import { requireSupabaseClient } from '../../../lib/supabase/client';
import { getCurrentHouseholdId } from '../../../lib/supabase/household';
import type { CalendarEvent } from '../types';

const POLL_INTERVAL_MS = 3000;

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export function useCalendarItems() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const refreshEvents = useCallback(async () => {
    const nextEvents = await fetchCalendarEvents();
    setEvents(nextEvents);
  }, []);

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

  useEffect(() => {
    let cancelled = false;
    const supabase = requireSupabaseClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function subscribe() {
      try {
        const householdId = await getCurrentHouseholdId();

        if (cancelled) return;

        channel = supabase
          .channel(`calendar-events-realtime-${householdId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'events',
              filter: `household_id=eq.${householdId}`,
            },
            async () => {
              try {
                await refreshEvents();
              } catch (error) {
                console.error('Realtime calendar sync failed:', error);
              }
            },
          )
          .subscribe();
      } catch (error) {
        console.error('Failed to subscribe to calendar realtime:', error);
      }
    }

    subscribe();

    return () => {
      cancelled = true;

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [refreshEvents]);

  useEffect(() => {
    const intervalId = window.setInterval(async () => {
      try {
        await refreshEvents();
      } catch (error) {
        console.error('Calendar polling sync failed:', error);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshEvents]);

  const selectedDayEvents = useMemo(
    () =>
      events
        .filter((event) => event.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [events, selectedDate],
  );

  async function addEvent(title: string, time = '12:00') {
    const cleanTitle = title.trim();
    const cleanTime = time.trim() || '12:00';

    if (!cleanTitle) return false;

    try {
      setErrorMessage('');

      const row = await insertCalendarEvent(cleanTitle, selectedDate, cleanTime);

      const newEvent: CalendarEvent = {
        id: row.id,
        household_id: row.household_id,
        title: row.title?.trim() || 'Untitled event',
        date: row.date,
        time: row.start_time?.trim() || '12:00',
        created_at: row.created_at ?? new Date().toISOString(),
      };

      setEvents((current) => {
        const withoutDuplicate = current.filter((event) => event.id !== newEvent.id);
        return [...withoutDuplicate, newEvent];
      });

      return true;
    } catch (error) {
      console.error('Failed to insert calendar event:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add event.');
      return false;
    }
  }

  async function deleteEvent(id: string) {
    const previousEvents = events;

    setEvents((current) => current.filter((event) => event.id !== id));

    try {
      setErrorMessage('');
      await deleteCalendarEvent(id);
    } catch (error) {
      console.error('Failed to delete calendar event:', error);

      setEvents(previousEvents);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete event.');
    }
  }

  return {
    events,
    selectedDayEvents,
    selectedDate,
    setSelectedDate,
    isLoading,
    errorMessage,
    addEvent,
    deleteEvent,
  };
}