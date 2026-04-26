import { useEffect, useState } from 'react';
import {
  deleteGroceryItem,
  fetchGroceryItems,
  insertGroceryItem,
  updateGroceryItemChecked,
} from '../services/grocerySupabaseService';
import { requireSupabaseClient } from '../../../lib/supabase/client';
import type { GroceryItem } from '../types';

const HOUSEHOLD_ID = '11111111-1111-1111-1111-111111111111';

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

  useEffect(() => {
    const supabase = requireSupabaseClient();

    const channel = supabase
      .channel('grocery-items-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grocery_items',
          filter: `household_id=eq.${HOUSEHOLD_ID}`,
        },
        async () => {
          try {
            const nextItems = await fetchGroceryItems();
            setItems(nextItems);
          } catch (error) {
            console.error('Failed to refresh grocery items after realtime event:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Failed to sync grocery items.');
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
      setErrorMessage('');
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

  async function addItem(name: string, category: string) {
    const cleanName = name.trim();
    const cleanCategory = category.trim() || 'Other';

    if (!cleanName) return;

    try {
      setErrorMessage('');

      const row = await insertGroceryItem(cleanName, cleanCategory);

      const newItem: GroceryItem = {
        id: row.id,
        household_id: row.household_id,
        name: row.name,
        category: row.category?.trim() || 'Other',
        checked: Boolean(row.is_checked),
        created_at: row.created_at ?? new Date().toISOString(),
      };

      setItems((current) => [newItem, ...current]);
    } catch (error) {
      console.error('Failed to insert grocery item:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add item.');
    }
  }

  async function deleteItem(id: string) {
    const previousItems = items;

    setItems((current) => current.filter((item) => item.id !== id));

    try {
      setErrorMessage('');
      await deleteGroceryItem(id);
    } catch (error) {
      console.error('Failed to delete grocery item:', error);

      setItems(previousItems);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete item.');
    }
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