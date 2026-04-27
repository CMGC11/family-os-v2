import { useCallback, useEffect, useMemo, useState } from 'react';
import { requireSupabaseClient } from '../../../lib/supabase/client';
import { getCurrentHouseholdId } from '../../../lib/supabase/household';
import {
  deletePackingItem,
  deletePrepItem,
  fetchPackingItems,
  fetchPrepItems,
  insertPackingItem,
  insertPrepItem,
  updatePackingItemPacked,
  updatePrepItemDone,
} from '../services/tripsSupabaseService';
import type { PackingItem, PrepItem } from '../types';

export function useTripDetailItems(tripId: string | null) {
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [prepItems, setPrepItems] = useState<PrepItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadItems = useCallback(async () => {
    if (!tripId) {
      setPackingItems([]);
      setPrepItems([]);
      setErrorMessage('');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const [nextPackingItems, nextPrepItems] = await Promise.all([
        fetchPackingItems(tripId),
        fetchPrepItems(tripId),
      ]);

      setPackingItems(nextPackingItems);
      setPrepItems(nextPrepItems);
    } catch (error) {
      console.error('Failed to load trip detail items:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load trip items.');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (!tripId) return undefined;

    let cancelled = false;
    const supabase = requireSupabaseClient();
    let packingChannel: ReturnType<typeof supabase.channel> | null = null;
    let prepChannel: ReturnType<typeof supabase.channel> | null = null;

    async function subscribe() {
      try {
        const householdId = await getCurrentHouseholdId();

        if (cancelled) return;

        packingChannel = supabase
          .channel(`trip-packing-items-${tripId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'packing_items',
              filter: `trip_id=eq.${tripId}`,
            },
            () => {
              loadItems();
            },
          )
          .subscribe();

        prepChannel = supabase
          .channel(`trip-prep-items-${tripId}-${householdId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'prep_items',
              filter: `trip_id=eq.${tripId}`,
            },
            () => {
              loadItems();
            },
          )
          .subscribe();
      } catch (error) {
        console.error('Failed to subscribe to trip detail items:', error);
      }
    }

    subscribe();

    return () => {
      cancelled = true;

      if (packingChannel) {
        supabase.removeChannel(packingChannel);
      }

      if (prepChannel) {
        supabase.removeChannel(prepChannel);
      }
    };
  }, [loadItems, tripId]);

  const packingProgress = useMemo(() => {
    const packedCount = packingItems.filter((item) => item.is_packed).length;
    return {
      packedCount,
      totalCount: packingItems.length,
    };
  }, [packingItems]);

  const prepProgress = useMemo(() => {
    const doneCount = prepItems.filter((item) => item.is_done).length;
    return {
      doneCount,
      totalCount: prepItems.length,
    };
  }, [prepItems]);

  async function addPackingItem(name: string) {
    const cleanName = name.trim();

    if (!tripId || !cleanName) return false;

    try {
      setErrorMessage('');
      const newItem = await insertPackingItem({ tripId, name: cleanName });
      setPackingItems((current) => [...current.filter((item) => item.id !== newItem.id), newItem]);
      return true;
    } catch (error) {
      console.error('Failed to add packing item:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add packing item.');
      return false;
    }
  }

  async function addPrepItem(name: string) {
    const cleanName = name.trim();

    if (!tripId || !cleanName) return false;

    try {
      setErrorMessage('');
      const newItem = await insertPrepItem({ tripId, name: cleanName });
      setPrepItems((current) => [...current.filter((item) => item.id !== newItem.id), newItem]);
      return true;
    } catch (error) {
      console.error('Failed to add prep item:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add prep item.');
      return false;
    }
  }

  async function togglePackingItem(id: string) {
    const item = packingItems.find((currentItem) => currentItem.id === id);

    if (!item) return;

    const nextPacked = !item.is_packed;
    const previousItems = packingItems;

    setPackingItems((current) =>
      current.map((currentItem) =>
        currentItem.id === id ? { ...currentItem, is_packed: nextPacked } : currentItem,
      ),
    );

    try {
      setErrorMessage('');
      await updatePackingItemPacked(id, nextPacked);
    } catch (error) {
      console.error('Failed to update packing item:', error);
      setPackingItems(previousItems);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update packing item.');
    }
  }

  async function togglePrepItem(id: string) {
    const item = prepItems.find((currentItem) => currentItem.id === id);

    if (!item) return;

    const nextDone = !item.is_done;
    const previousItems = prepItems;

    setPrepItems((current) =>
      current.map((currentItem) =>
        currentItem.id === id ? { ...currentItem, is_done: nextDone } : currentItem,
      ),
    );

    try {
      setErrorMessage('');
      await updatePrepItemDone(id, nextDone);
    } catch (error) {
      console.error('Failed to update prep item:', error);
      setPrepItems(previousItems);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update prep item.');
    }
  }

  async function removePackingItem(id: string) {
    const previousItems = packingItems;

    setPackingItems((current) => current.filter((item) => item.id !== id));

    try {
      setErrorMessage('');
      await deletePackingItem(id);
    } catch (error) {
      console.error('Failed to delete packing item:', error);
      setPackingItems(previousItems);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete packing item.');
    }
  }

  async function removePrepItem(id: string) {
    const previousItems = prepItems;

    setPrepItems((current) => current.filter((item) => item.id !== id));

    try {
      setErrorMessage('');
      await deletePrepItem(id);
    } catch (error) {
      console.error('Failed to delete prep item:', error);
      setPrepItems(previousItems);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete prep item.');
    }
  }

  return {
    packingItems,
    prepItems,
    packingProgress,
    prepProgress,
    isLoading,
    errorMessage,
    addPackingItem,
    addPrepItem,
    togglePackingItem,
    togglePrepItem,
    removePackingItem,
    removePrepItem,
  };
}
