import type { CalendarEvent } from '../types';

const STORAGE_KEY = 'familyos:calendar';
const HOUSEHOLD_ID = 'demo-household';
const SELECTED_DATE = '2026-04-24';

function now() {
  return new Date().toISOString();
}

const fallbackEvents: CalendarEvent[] = [
  {
    id: '1',
    household_id: HOUSEHOLD_ID,
    title: 'Daycare visit',
    date: SELECTED_DATE,
    time: '09:00',
    created_at: now(),
  },
  {
    id: '2',
    household_id: HOUSEHOLD_ID,
    title: 'Pediatric check',
    date: SELECTED_DATE,
    time: '15:30',
    created_at: now(),
  },
  {
    id: '3',
    household_id: HOUSEHOLD_ID,
    title: 'Dinner prep',
    date: SELECTED_DATE,
    time: '18:00',
    created_at: now(),
  },
];

export function loadCalendarEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallbackEvents;

    const parsed = JSON.parse(raw) as CalendarEvent[];
    return Array.isArray(parsed) ? parsed : fallbackEvents;
  } catch {
    return fallbackEvents;
  }
}

export function saveCalendarEvents(events: CalendarEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function getHouseholdId() {
  return HOUSEHOLD_ID;
}

export function getSelectedDate() {
  return SELECTED_DATE;
}