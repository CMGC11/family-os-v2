import { useEffect, useState } from 'react';
import {
  getHouseholdId,
  loadGroceryItems,
  saveGroceryItems,
} from '../../../lib/store/familyStore';
import type { GroceryItem } from '../types';

export function useGroceryItems() {
  const [items, setItems] = useState<GroceryItem[]>(() => loadGroceryItems());
  const householdId = getHouseholdId();

  useEffect(() => {
    saveGroceryItems(items);
  }, [items]);

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
      ...current,
      {
        id: crypto.randomUUID(),
        household_id: householdId,
        name: cleanName,
        category: cleanCategory,
        checked: false,
        created_at: new Date().toISOString(),
      },
    ]);
  }

  function deleteItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return {
    items,
    toggleItem,
    addItem,
    deleteItem,
  };
}