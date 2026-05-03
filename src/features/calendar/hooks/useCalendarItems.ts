import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  deleteCalendarEvent,
  fetchCalendarEvents,
  insertCalendarEvent,
  updateCalendarEvent,
  type CalendarEventRange,
} from '../services/calendarSupabaseService';
import { fetchCalendarSpecialEvents } from '../services/calendarSpecialEventsService';
import { requireSupabaseClient } from '../../../lib/supabase/client';
import { getCurrentHouseholdId } from '../../../lib/supabase/household';
import type { CalendarEvent, CalendarEventInput } from '../types';

const POLL_INTERVAL_MS = 8000;

type UseCalendarItemsOptions = {
  visibleRange?: CalendarEventRange | null;
};

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function getEffectiveEndDate(event: CalendarEvent) {
  return event.end_date || event.date;
}

function isEventOnDate(event: CalendarEvent, dateString: string) {
  return event.date <= dateString && getEffectiveEndDate(event) >= dateString;
}

function eventOverlapsRange(event: CalendarEvent, range?: CalendarEventRange | null) {
  if (!range) return true;

  return event.date <= range.toDate && getEffectiveEndDate(event) >= range.fromDate;
}

function getEventSortTime(event: CalendarEvent) {
  if (event.all_day) return '00:00';
  return event.start_time?.trim() || event.time || '12:00';
}

function sortEventsByTime(events: CalendarEvent[]) {
  return [...events].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;

    const timeCompare = getEventSortTime(a).localeCompare(getEventSortTime(b));
    if (timeCompare !== 0) return timeCompare;

    return a.title.localeCompare(b.title);
  });
}

function getYearsForRange(range?: CalendarEventRange | null) {
  if (!range) {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
  }

  const startYear = Number(range.fromDate.slice(0, 4));
  const endYear = Number(range.toDate.slice(0, 4));

  if (!Number.isFinite(startYear) || !Number.isFinite(endYear)) {
    const currentYear = new Date().getFullYear();
    return [currentYear];
  }

  const years: number[] = [];

  for (let year = startYear; year <= endYear; year += 1) {
    years.push(year);
  }

  return years;
}

function getRangeKey(range?: CalendarEventRange | null) {
  return range ? `${range.fromDate}|${range.toDate}` : 'all';
}

export function useCalendarItems(options: UseCalendarItemsOptions = {}) {
  const visibleRange = options.visibleRange ?? null;
  const visibleRangeRef = useRef<CalendarEventRange | null>(visibleRange);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [specialEvents, setSpecialEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const rangeKey = getRangeKey(visibleRange);

  visibleRangeRef.current = visibleRange;

  const refreshRealEvents = useCallback(async () => {
    const nextEvents = await fetchCalendarEvents(visibleRangeRef.current ?? undefined);
    setEvents(nextEvents);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadVisibleRange() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const range = visibleRangeRef.current;
        const years = getYearsForRange(range);
        const [nextEvents, nextSpecialEvents] = await Promise.all([
          fetchCalendarEvents(range ?? undefined),
          fetchCalendarSpecialEvents(years),
        ]);

        if (!cancelled) {
          setEvents(nextEvents);
          setSpecialEvents(nextSpecialEvents.filter((event) => eventOverlapsRange(event, range)));
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

    loadVisibleRange();

    return () => {
      cancelled = true;
    };
  }, [rangeKey]);

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
                await refreshRealEvents();
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
  }, [refreshRealEvents]);

  useEffect(() => {
    const intervalId = window.setInterval(async () => {
      try {
        await refreshRealEvents();
      } catch (error) {
        console.error('Calendar polling sync failed:', error);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshRealEvents]);

  const allEvents = useMemo(() => sortEventsByTime([...events, ...specialEvents]), [events, specialEvents]);

  const selectedDayEvents = useMemo(
    () => sortEventsByTime(allEvents.filter((event) => isEventOnDate(event, selectedDate))),
    [allEvents, selectedDate],
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

        if (!eventOverlapsRange(newEvent, visibleRangeRef.current)) {
          return sortEventsByTime(withoutDuplicate);
        }

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

      setEvents((current) => {
        const withoutUpdatedEvent = current.filter((event) => event.id !== updatedEvent.id);

        if (!eventOverlapsRange(updatedEvent, visibleRangeRef.current)) {
          return sortEventsByTime(withoutUpdatedEvent);
        }

        return sortEventsByTime([...withoutUpdatedEvent, updatedEvent]);
      });

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
    events: allEvents,
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
