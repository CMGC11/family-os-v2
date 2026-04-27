import { useEffect, useState } from 'react';
import {
  fetchTrips,
  insertTrip,
} from '../services/tripsSupabaseService';
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

      setItems((current) => [newItem, ...current]);
    } catch (error) {
      console.error('Failed to insert trip:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add trip.');
    }
  }

  return {
    items,
    isLoading,
    errorMessage,
    addItem,
  };
}