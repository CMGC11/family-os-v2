import { requireSupabaseClient } from '../../../lib/supabase/client';
import { getCurrentHouseholdId } from '../../../lib/supabase/household';
import type { GroceryItem } from '../types';

type GroceryRow = {
  id: string;
  household_id: string;
  name: string;
  category: string | null;
  is_checked: boolean | null;
  created_at: string | null;
};

function mapRowToItem(row: GroceryRow): GroceryItem {
  return {
    id: row.id,
    household_id: row.household_id,
    name: row.name,
    category: row.category?.trim() || 'Other',
    checked: Boolean(row.is_checked),
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

export async function fetchGroceryItems(): Promise<GroceryItem[]> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('grocery_items')
    .select('id, household_id, name, category, is_checked, created_at')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapRowToItem);
}

export async function insertGroceryItem(name: string, category: string) {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('grocery_items')
    .insert({
      household_id: householdId,
      name,
      category,
      is_checked: false,
    })
    .select('id, household_id, name, category, is_checked, created_at')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateGroceryItemChecked(id: string, checked: boolean): Promise<void> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { error } = await supabase
    .from('grocery_items')
    .update({
      is_checked: checked,
      checked_at: checked ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .eq('household_id', householdId);

  if (error) {
    throw error;
  }
}

export async function deleteGroceryItem(id: string): Promise<void> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { error } = await supabase
    .from('grocery_items')
    .delete()
    .eq('id', id)
    .eq('household_id', householdId);

  if (error) {
    throw error;
  }
}