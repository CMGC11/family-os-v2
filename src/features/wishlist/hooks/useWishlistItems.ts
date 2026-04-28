import { useEffect, useState } from 'react';
import {
  deleteWishlistItem,
  fetchWishlistItems,
  insertWishlistItem,
} from '../services/wishlistSupabaseService';
import { requireSupabaseClient } from '../../../lib/supabase/client';
import { getCurrentHouseholdId } from '../../../lib/supabase/household';
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

  useEffect(() => {
    let cancelled = false;
    const supabase = requireSupabaseClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function subscribe() {
      try {
        const householdId = await getCurrentHouseholdId();

        if (cancelled) return;

        channel = supabase
          .channel(`wishlist-items-realtime-${householdId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'wishlist_items',
              filter: `household_id=eq.${householdId}`,
            },
            async () => {
              try {
                const nextItems = await fetchWishlistItems();
                setItems(nextItems);
              } catch (error) {
                console.error('Failed to refresh wishlist items after realtime event:', error);
                setErrorMessage(error instanceof Error ? error.message : 'Failed to sync wishlist items.');
              }
            },
          )
          .subscribe();
      } catch (error) {
        console.error('Failed to subscribe to wishlist realtime:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to subscribe to wishlist sync.');
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

  async function addItem(title: string, note = '', ownerId?: string) {
    const cleanTitle = title.trim();
    const cleanNote = note.trim();

    if (!cleanTitle) return null;

    try {
      setErrorMessage('');

      const newItem = await insertWishlistItem(cleanTitle, cleanNote, ownerId);

      setItems((current) => {
        const withoutDuplicate = current.filter((item) => item.id !== newItem.id);
        return [newItem, ...withoutDuplicate];
      });

      return newItem;
    } catch (error) {
      console.error('Failed to insert wishlist item:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add wishlist item.');
      return null;
    }
  }

  async function deleteItem(id: string) {
    const previousItems = items;

    setItems((current) => current.filter((item) => item.id !== id));

    try {
      setErrorMessage('');
      await deleteWishlistItem(id);
    } catch (error) {
      console.error('Failed to delete wishlist item:', error);

      setItems(previousItems);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete wishlist item.');
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
