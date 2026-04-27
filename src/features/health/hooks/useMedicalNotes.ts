import { useEffect, useState } from 'react';
import {
  deleteMedicalNote,
  fetchMedicalNotes,
  insertMedicalNote,
} from '../services/healthSupabaseService';
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

  async function addItem(title: string, content = '', date = '') {
    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    const cleanDate = date.trim();

    if (!cleanTitle) return;

    try {
      setErrorMessage('');

      const newItem = await insertMedicalNote(cleanTitle, cleanContent, cleanDate);

      setItems((current) => [newItem, ...current]);
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