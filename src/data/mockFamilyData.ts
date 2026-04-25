import type { CalendarDay, FamilyMember, HubItem, QuickCard, Task } from '../app/types';

export const familyMembers: FamilyMember[] = [
  { name: 'Bruno', role: 'Planning', color: 'avatarBlue' },
  { name: 'Ana', role: 'Home', color: 'avatarRose' },
  { name: 'Baby', role: 'Tiny CEO', color: 'avatarAmber' },
];

export const monthDays: CalendarDay[] = [
  { date: 31, muted: true, events: [] },
  { date: 1, events: ['Rent'] },
  { date: 2, events: [] },
  { date: 3, events: ['Health'] },
  { date: 4, events: [] },
  { date: 5, events: ['Trip'] },
  { date: 6, events: [] },
  { date: 7, events: ['Grocery'] },
  { date: 8, events: [] },
  { date: 9, events: ['Recipe night'] },
  { date: 10, events: [] },
  { date: 11, events: ['Family call'] },
  { date: 12, events: [] },
  { date: 13, events: [] },
  { date: 14, events: ['Wishlist'] },
  { date: 15, events: [] },
  { date: 16, events: ['Doctor'] },
  { date: 17, events: [] },
  { date: 18, events: ['Dinner'] },
  { date: 19, events: [] },
  { date: 20, events: [] },
  { date: 21, events: ['Pediatric'] },
  { date: 22, events: [] },
  { date: 23, events: ['Dinner prep'] },
  { date: 24, selected: true, events: ['Daycare', 'Plumber'] },
  { date: 25, today: true, events: ['Movie'] },
  { date: 26, events: ['Walk', 'Pack'] },
  { date: 27, events: ['Quiet day'] },
  { date: 28, events: [] },
  { date: 29, events: ['Grocery'] },
  { date: 30, events: [] },
  { date: 1, muted: true, events: [] },
  { date: 2, muted: true, events: [] },
  { date: 3, muted: true, events: [] },
  { date: 4, muted: true, events: [] },
];

export const tasks: Task[] = [
  { title: 'Confirm daycare documents', area: 'Family', due: 'Today', done: false },
  { title: 'Buy oat milk, fruit, diapers', area: 'Grocery', due: 'Today', done: false },
  { title: 'Book pregnancy photoshoot shortlist', area: 'Wishlist', due: 'Tomorrow', done: true },
  { title: 'Update travel packing list', area: 'Trips', due: 'Sat', done: false },
];

export const hubItems: HubItem[] = [
  {
    key: 'wishlist',
    title: 'Wishlist',
    subtitle: 'Gift ideas, shared wants, saved links',
    icon: '♡',
    tint: 'tintRose',
  },
  {
    key: 'trips',
    title: 'Trips',
    subtitle: 'Packing, itinerary, documents',
    icon: '✈',
    tint: 'tintBlue',
  },
  {
    key: 'health',
    title: 'Health',
    subtitle: 'Notes, appointments, medication',
    icon: '+',
    tint: 'tintGreen',
  },
  {
    key: 'recipes',
    title: 'Recipes',
    subtitle: 'A calm family recipe book',
    icon: '🍳',
    tint: 'tintOrange',
  },
  {
    key: 'grocery',
    title: 'Grocery',
    subtitle: 'Grouped shopping execution',
    icon: '◌',
    tint: 'tintLime',
  },
];

export const quickCards: QuickCard[] = [
  { label: 'Today', value: '4 items', detail: '2 events · 2 tasks' },
  { label: 'This week', value: '12 plans', detail: 'Mostly under control, shocking' },
  { label: 'Family', value: '3 people', detail: 'Shared household view' },
];