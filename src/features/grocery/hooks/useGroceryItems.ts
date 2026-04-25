import { useEffect, useState } from 'react';
import {
  fetchGroceryItems,
  updateGroceryItemChecked,
} from '../services/grocerySupabaseService';
import type { GroceryItem } from '../types';

export function useGroceryItems() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const nextItems = await fetchGroceryItems();

        if (!cancelled) {
          setItems(nextItems);
        }
      } catch (error) {
        console.error('Failed to load grocery items:', error);

        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : 'Failed to load grocery items.');
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

  async function toggleItem(id: string) {
    const target = items.find((item) => item.id === id);

    if (!target) return;

    const nextChecked = !target.checked;

    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, checked: nextChecked } : item,
      ),
    );

    try {
      await updateGroceryItemChecked(id, nextChecked);
    } catch (error) {
      console.error('Failed to update grocery item:', error);

      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, checked: target.checked } : item,
        ),
      );

      setErrorMessage(error instanceof Error ? error.message : 'Failed to update grocery item.');
    }
  }

  function addItem(name: string, category: string) {
    const cleanName = name.trim();
    const cleanCategory = category.trim() || 'Other';

    if (!cleanName) return;

    setItems((current) => [
      {
        id: crypto.randomUUID(),
        household_id: '11111111-1111-1111-1111-111111111111',
        name: cleanName,
        category: cleanCategory,
        checked: false,
        created_at: new Date().toISOString(),
      },
      ...current,
    ]);
  }

  function deleteItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return {
    items,
    isLoading,
    errorMessage,
    toggleItem,
    addItem,
    deleteItem,
  };
}