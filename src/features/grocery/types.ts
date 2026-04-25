export type GroceryItem = {
  id: string;
  household_id: string; // ← important for future sync
  name: string;
  category: string;
  checked: boolean;
  created_at: string;
};