import type { TaskItem } from '../types';

const STORAGE_KEY = 'familyos:todo';
const HOUSEHOLD_ID = 'demo-household';

function now() {
  return new Date().toISOString();
}

const fallbackTasks: TaskItem[] = [
  {
    id: '1',
    household_id: HOUSEHOLD_ID,
    title: 'Confirm daycare documents',
    area: 'Family',
    due: 'Today',
    done: false,
    created_at: now(),
  },
  {
    id: '2',
    household_id: HOUSEHOLD_ID,
    title: 'Buy oat milk, fruit, diapers',
    area: 'Grocery',
    due: 'Today',
    done: false,
    created_at: now(),
  },
  {
    id: '3',
    household_id: HOUSEHOLD_ID,
    title: 'Book pregnancy photoshoot shortlist',
    area: 'Wishlist',
    due: 'Tomorrow',
    done: true,
    created_at: now(),
  },
  {
    id: '4',
    household_id: HOUSEHOLD_ID,
    title: 'Update travel packing list',
    area: 'Trips',
    due: 'Sat',
    done: false,
    created_at: now(),
  },
];

export function loadTodoItems(): TaskItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallbackTasks;

    const parsed = JSON.parse(raw) as TaskItem[];
    return Array.isArray(parsed) ? parsed : fallbackTasks;
  } catch {
    return fallbackTasks;
  }
}

export function saveTodoItems(items: TaskItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getHouseholdId() {
  return HOUSEHOLD_ID;
}