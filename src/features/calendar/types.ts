export type CalendarEvent = {
  id: string;
  household_id: string;
  title: string;
  date: string;
  time: string;
  created_at: string;

  end_date?: string | null;
  is_multi_day?: boolean | null;
  start_time?: string | null;
  end_time?: string | null;
  all_day?: boolean | null;

  category?: string | null;
  visibility?: string | null;
  responsible_id?: string | null;
  location?: string | null;
  notes?: string | null;
  reminder?: string | null;
  is_busy?: boolean | null;
  updated_at?: string | null;
  recurrence?: string | null;
  recurrence_end?: string | null;
  recurrence_parent_id?: string | null;
};

export type CalendarEventInput = {
  title: string;
  date: string;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  all_day?: boolean;
};

export type CreateCalendarEventInput = CalendarEventInput;

export type UpdateCalendarEventInput = CalendarEventInput;