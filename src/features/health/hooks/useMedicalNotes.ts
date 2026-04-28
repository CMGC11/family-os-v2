import { useEffect, useState } from 'react';
import {
  deleteMedicalNote,
  fetchMedicalNotes,
  insertMedicalNote,
} from '../services/healthSupabaseService';
import { requireSupabaseClient } from '../../../lib/supabase/client';
import { getCurrentHouseholdId } from '../../../lib/supabase/household';
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

  useEffect(() => {
    let cancelled = false;
    const supabase = requireSupabaseClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function subscribe() {
      try {
        const householdId = await getCurrentHouseholdId();

        if (cancelled) return;

        channel = supabase
          .channel(`medical-notes-realtime-${householdId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'medical_notes',
              filter: `household_id=eq.${householdId}`,
            },
            async () => {
              try {
                const nextItems = await fetchMedicalNotes();
                setItems(nextItems);
              } catch (error) {
                console.error('Failed to refresh medical notes after realtime event:', error);
                setErrorMessage(error instanceof Error ? error.message : 'Failed to sync medical notes.');
              }
            },
          )
          .subscribe();
      } catch (error) {
        console.error('Failed to subscribe to medical notes realtime:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to subscribe to health sync.');
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

  async function addItem(title: string, content = '', date = '', personId?: string) {
    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    const cleanDate = date.trim();

    if (!cleanTitle) return;

    try {
      setErrorMessage('');

      const newItem = await insertMedicalNote(cleanTitle, cleanContent, cleanDate, personId);

      setItems((current) => {
        const withoutDuplicate = current.filter((item) => item.id !== newItem.id);
        return [newItem, ...withoutDuplicate];
      });
    } catch (error) {
      console.error('Failed to insert medical note:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add health note.');
    }
  }

  async function deleteItem(id: string) {
    const previousItems = items;

    setItems((current) => current.filter((item) => item.id !== id));

    try {
      setErrorMessage('');
      await deleteMedicalNote(id);
    } catch (error) {
      console.error('Failed to delete medical note:', error);

      setItems(previousItems);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete health note.');
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