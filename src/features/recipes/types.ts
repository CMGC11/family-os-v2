export type Recipe = {
  id: string;
  household_id: string;
  name: string;
  ingredients: string;
  steps: string;
  serves: number | null;
  notes: string;
  tags: string[];
  source_url: string;
  category: string;
  is_pinned: boolean;
  use_count: number;
  created_at: string;
};