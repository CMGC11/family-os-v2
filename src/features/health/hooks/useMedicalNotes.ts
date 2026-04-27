import { useEffect, useState } from 'react';
import { fetchMedicalNotes } from '../services/healthSupabaseService';
import type { MedicalNote } from '../types';

export function useMedicalNotes() {
  const [items, setItems] = useState<MedicalNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const nextItems = await fetchMedicalNotes();

        if (!cancelled) {
          setItems(nextItems);
        }
      } catch (error) {
        console.error('Failed to load medical notes:', error);

        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : 'Failed to load medical notes.');
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

  return {
    items,
    isLoading,
    errorMessage,
  };
}