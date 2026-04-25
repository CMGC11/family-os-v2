export type AppTab = 'home' | 'calendar' | 'todo' | 'hub';

export type FamilyMember = {
  name: string;
  role: string;
  color: string;
};

export type CalendarDay = {
  date: number;
  muted?: boolean;
  selected?: boolean;
  today?: boolean;
  events: string[];
};

export type Task = {
  title: string;
  area: string;
  due: string;
  done: boolean;
};

export type HubItem = {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  tint: string;
};

export type QuickCard = {
  label: string;
  value: string;
  detail: string;
};