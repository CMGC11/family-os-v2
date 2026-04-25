import { useEffect, useState } from 'react';
import { loadGroceryItems, saveGroceryItems } from '../services/groceryLocalService';
import type { GroceryItem } from '../types';

export function useGroceryItems() {
  const [items, setItems] = useState<GroceryItem[]>(() => loadGroceryItems());

  useEffect(() => {
    saveGroceryItems(items);
  }, [items]);

  function toggleItem(id: string) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  }

  function addItem(name: string, category: string) {
    const cleanName = name.trim();
    const cleanCategory = category.trim() || 'Other';

    if (!cleanName) return;

    setItems((currentItems) => [
      ...currentItems,
      {
        id: crypto.randomUUID(),
        name: cleanName,
        category: cleanCategory,
        checked: false,
      },
    ]);
  }

  return {
    items,
    toggleItem,
    addItem,
  };
}