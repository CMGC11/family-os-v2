import { useEffect, useState } from 'react';
import { fetchGroceryItems } from '../services/grocerySupabaseService';
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
          if (error instanceof Error) {
            setErrorMessage(error.message);
          } else {
            setErrorMessage(JSON.stringify(error));
          }
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

  function toggleItem(id: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
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