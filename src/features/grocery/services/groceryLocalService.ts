import type { GroceryItem } from '../types';

const STORAGE_KEY = 'familyos:grocery';

const fallbackItems: GroceryItem[] = [
  { id: '1', name: 'Bananas', category: 'Produce', checked: false },
  { id: '2', name: 'Oat milk', category: 'Dairy', checked: false },
  { id: '3', name: 'Diapers', category: 'Baby', checked: false },
];

export function loadGroceryItems(): GroceryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallbackItems;

    const parsed = JSON.parse(raw) as GroceryItem[];
    return Array.isArray(parsed) ? parsed : fallbackItems;
  } catch {
    return fallbackItems;
  }
}

export function saveGroceryItems(items: GroceryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}