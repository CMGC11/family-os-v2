import { useEffect, useState } from 'react';
import {
  fetchWishlistItems,
  insertWishlistItem,
} from '../services/wishlistSupabaseService';
import type { WishlistItem } from '../types';

export function useWishlistItems() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const nextItems = await fetchWishlistItems();

        if (!cancelled) {
          setItems(nextItems);
        }
      } catch (error) {
        console.error('Failed to load wishlist items:', error);

        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : 'Failed to load wishlist items.');
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

  async function addItem(title: string, note = '') {
    const cleanTitle = title.trim();
    const cleanNote = note.trim();

    if (!cleanTitle) return;

    try {
      setErrorMessage('');

      const newItem = await insertWishlistItem(cleanTitle, cleanNote);

      setItems((current) => [newItem, ...current]);
    } catch (error) {
      console.error('Failed to insert wishlist item:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add wishlist item.');
    }
  }

  return {
    items,
    isLoading,
    errorMessage,
    addItem,
  };
}