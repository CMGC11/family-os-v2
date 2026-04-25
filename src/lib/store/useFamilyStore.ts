import { useState } from 'react';

export type GroceryItem = {
  id: string;
  name: string;
  category: string;
  checked: boolean;
};

export function useFamilyStore() {
  const [grocery, setGrocery] = useState<GroceryItem[]>([
    { id: '1', name: 'Bananas', category: 'Produce', checked: false },
    { id: '2', name: 'Oat milk', category: 'Dairy', checked: false },
    { id: '3', name: 'Diapers', category: 'Baby', checked: false },
  ]);

  function toggleItem(id: string) {
    setGrocery((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  }

  function addItem(name: string, category: string) {
    setGrocery((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name,
        category,
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