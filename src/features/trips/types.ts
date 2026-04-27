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