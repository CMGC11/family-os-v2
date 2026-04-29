import type { FamilyMember, HubItem } from '../app/types';

export const familyMembers: FamilyMember[] = [
  { name: 'Bruno', role: 'Planning', color: 'avatarBlue' },
  { name: 'Ana', role: 'Home', color: 'avatarRose' },
  { name: 'Baby', role: 'Tiny CEO', color: 'avatarAmber' },
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
