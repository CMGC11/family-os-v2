import type { CalendarEvent } from '../../features/calendar/types';
import type { GroceryItem } from '../../features/grocery/types';
import type { TaskItem } from '../../features/todo/types';

const HOUSEHOLD_ID = 'demo-household';

const STORAGE_KEYS = {
  grocery: 'familyos:grocery',
  todo: 'familyos:todo',
  calendar: 'familyos:calendar',
} as const;

function now() {
  return new Date().toISOString();
}

const fallbackGrocery: GroceryItem[] = [
  {
    id: '1',
    household_id: HOUSEHOLD_ID,
    name: 'Bananas',
    category: 'Produce',
    checked: false,
    created_at: now(),
  },
];

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

const fallbackCalendarEvents: CalendarEvent[] = [
  {
    id: '1',
    household_id: HOUSEHOLD_ID,
    title: 'Daycare visit',
    date: '2026-04-24',
    time: '09:00',
    created_at: now(),
  },
  {
    id: '2',
    household_id: HOUSEHOLD_ID,
    title: 'Pediatric check',
    date: '2026-04-24',
    time: '15:30',
    created_at: now(),
  },
  {
    id: '3',
    household_id: HOUSEHOLD_ID,
    title: 'Dinner prep',
    date: '2026-04-24',
    time: '18:00',
    created_at: now(),
  },
];

function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

export function getHouseholdId() {
  return HOUSEHOLD_ID;
}

export function loadGroceryItems() {
  return loadFromStorage<GroceryItem>(STORAGE_KEYS.grocery, fallbackGrocery);
}

export function saveGroceryItems(items: GroceryItem[]) {
  saveToStorage(STORAGE_KEYS.grocery, items);
}

export function loadTodoItems() {
  return loadFromStorage<TaskItem>(STORAGE_KEYS.todo, fallbackTasks);
}

export function saveTodoItems(items: TaskItem[]) {
  saveToStorage(STORAGE_KEYS.todo, items);
}

export function loadCalendarEvents() {
  return loadFromStorage<CalendarEvent>(STORAGE_KEYS.calendar, fallbackCalendarEvents);
}

export function saveCalendarEvents(events: CalendarEvent[]) {
  saveToStorage(STORAGE_KEYS.calendar, events);
}