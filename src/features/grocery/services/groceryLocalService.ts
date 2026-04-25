import type { GroceryItem } from '../types';

const STORAGE_KEY = 'familyos:grocery';
const HOUSEHOLD_ID = 'demo-household'; // temp, will come from auth later

function now() {
  return new Date().toISOString();
}

const fallbackItems: GroceryItem[] = [
  {
    id: '1',
    household_id: HOUSEHOLD_ID,
    name: 'Bananas',
    category: 'Produce',
    checked: false,
    created_at: now(),
  },
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

export function getHouseholdId() {
  return HOUSEHOLD_ID;
}