import { useEffect, useState } from 'react';
import {
  deleteTrip,
  fetchTrips,
  insertTrip,
} from '../services/tripsSupabaseService';
import { requireSupabaseClient } from '../../../lib/supabase/client';
import { getCurrentHouseholdId } from '../../../lib/supabase/household';
import type { Trip } from '../types';

export function useTrips() {
  const [items, setItems] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const nextItems = await fetchTrips();

        if (!cancelled) {
          setItems(nextItems);
        }
      } catch (error) {
        console.error('Failed to load trips:', error);

        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : 'Failed to load trips.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadItems();

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
          .channel(`trips-realtime-${householdId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'trips',
              filter: `household_id=eq.${householdId}`,
            },
            async () => {
              try {
                const nextItems = await fetchTrips();
                setItems(nextItems);
              } catch (error) {
                console.error('Failed to refresh trips after realtime event:', error);
                setErrorMessage(error instanceof Error ? error.message : 'Failed to sync trips.');
              }
            },
          )
          .subscribe();
      } catch (error) {
        console.error('Failed to subscribe to trips realtime:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to subscribe to trips sync.');
      }
    }

    subscribe();

    return () => {
      cancelled = true;

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  async function addItem(input: {
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
  }) {
    const cleanTitle = input.title.trim();

    if (!cleanTitle || !input.start_date || !input.end_date) return;

    try {
      setErrorMessage('');

      const newItem = await insertTrip({
        title: cleanTitle,
        destination: input.destination.trim(),
        start_date: input.start_date,
        end_date: input.end_date,
      });

      setItems((current) => {
        const withoutDuplicate = current.filter((item) => item.id !== newItem.id);
        return [newItem, ...withoutDuplicate];
      });
    } catch (error) {
      console.error('Failed to insert trip:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add trip.');
    }
  }

  async function deleteItem(id: string) {
    const previousItems = items;

    setItems((current) => current.filter((item) => item.id !== id));

    try {
      setErrorMessage('');
      await deleteTrip(id);
    } catch (error) {
      console.error('Failed to delete trip:', error);

      setItems(previousItems);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete trip.');
    }
  }

  return {
    items,
    isLoading,
    errorMessage,
    addItem,
    deleteItem,
  };
}