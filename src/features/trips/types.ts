export type Trip = {
  id: string;
  household_id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  participant_ids: string[];
  accommodation_link: string;
  notes: string;
  created_at: string;
};

export type PackingItem = {
  id: string;
  trip_id: string;
  name: string;
  assigned_to: string;
  is_packed: boolean;
  created_at: string;
};

export type PrepItem = {
  id: string;
  trip_id: string;
  household_id: string;
  name: string;
  is_done: boolean;
  created_by: string;
  created_at: string;
};
