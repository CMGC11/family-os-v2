import { useState } from 'react';

export type GroceryItem = {
  id: string;
  name: string;
  category: string;
  checked: boolean;
};

const initialGrocery: GroceryItem[] = [
  { id: '1', name: 'Bananas', category: 'Produce', checked: false },
  { id: '2', name: 'Oat milk', category: 'Dairy', checked: false },
  { id: '3', name: 'Diapers', category: 'Baby', checked: false },
];

export function useFamilyStore() {
  const [grocery, setGrocery] = useState<GroceryItem[]>(initialGrocery);

  function toggleItem(id: string) {
    setGrocery((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  }

  function addItem(name: string, category: string) {
    const cleanName = name.trim();
    const cleanCategory = category.trim() || 'Other';

    if (!cleanName) return;

    setGrocery((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: cleanName,
        category: cleanCategory,
        checked: false,
      },
    ]);
  }

  return {
    grocery,
    toggleItem,
    addItem,
  };
}