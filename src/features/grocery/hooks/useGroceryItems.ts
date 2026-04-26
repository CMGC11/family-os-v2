import { useEffect, useState } from 'react';
import {
  deleteGroceryItem,
  fetchGroceryItems,
  insertGroceryItem,
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