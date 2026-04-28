import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deleteCalendarEvent,
  fetchCalendarEvents,
  insertCalendarEvent,
  updateCalendarEvent,
} from '../services/calendarSupabaseService';
import { requireSupabaseClient } from '../../../lib/supabase/client';
import { getCurrentHouseholdId } from '../../../lib/supabase/household';
import type { CalendarEvent, CalendarEventInput } from '../types';

const POLL_INTERVAL_MS = 3000;

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function getEffectiveEndDate(event: CalendarEvent) {
  return event.end_date || event.date;
}

function isEventOnDate(event: CalendarEvent, dateString: string) {
  return event.date <= dateString && getEffectiveEndDate(event) >= dateString;
}

function getEventSortTime(event: CalendarEvent) {
  if (event.all_day) return '00:00';
  return event.start_time?.trim() || event.time || '12:00';
}

function sortEventsByTime(events: CalendarEvent[]) {
  return [...events].sort((a, b) => getEventSortTime(a).localeCompare(getEventSortTime(b)));
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
    () => sortEventsByTime(events.filter((event) => isEventOnDate(event, selectedDate))),
    [events, selectedDate],
  );

  async function addEvent(input: CalendarEventInput) {
    const cleanTitle = input.title.trim();
    const effectiveEndDate = input.end_date || input.date;

    if (!cleanTitle || effectiveEndDate < input.date) return false;

    try {
      setErrorMessage('');

      const newEvent = await insertCalendarEvent({
        ...input,
        title: cleanTitle,
        end_date: effectiveEndDate,
      });

      setEvents((current) => {
        const withoutDuplicate = current.filter((event) => event.id !== newEvent.id);
        return sortEventsByTime([...withoutDuplicate, newEvent]);
      });

      return true;
    } catch (error) {
      console.error('Failed to insert calendar event:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add event.');
      return false;
    }
  }

  async function editEvent(id: string, input: CalendarEventInput) {
    const cleanTitle = input.title.trim();
    const effectiveEndDate = input.end_date || input.date;

    if (!cleanTitle || effectiveEndDate < input.date) return false;

    try {
      setErrorMessage('');

      const updatedEvent = await updateCalendarEvent(id, {
        ...input,
        title: cleanTitle,
        end_date: effectiveEndDate,
      });

      setEvents((current) =>
        sortEventsByTime(current.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))),
      );

      return true;
    } catch (error) {
      console.error('Failed to update calendar event:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update event.');
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
    editEvent,
    deleteEvent,
  };
}
