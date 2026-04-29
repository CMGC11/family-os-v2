export type AppTab = 'home' | 'calendar' | 'todo' | 'hub';

export type FamilyMember = {
  name: string;
  role: string;
  color: string;
};

export type HubItem = {
  key: 'wishlist' | 'trips' | 'health' | 'recipes' | 'grocery';
  title: string;
  subtitle: string;
  icon: string;
  tint: string;
};
