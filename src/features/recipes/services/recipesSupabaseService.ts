import { requireSupabaseClient } from '../../../lib/supabase/client';
import { getCurrentHouseholdId } from '../../../lib/supabase/household';
import type { Recipe } from '../types';

type RecipeRow = {
  id: string;
  household_id: string;
  name: string;
  ingredients: string | null;
  steps: string | null;
  serves: number | null;
  notes: string | null;
  tags: string[] | null;
  source_url: string | null;
  category: string | null;
  is_pinned: boolean | null;
  use_count: number | null;
  created_at: string | null;
};

export type RecipeInput = {
  name: string;
  ingredients: string;
  steps: string;
  category: string;
  serves: number | null;
};

const RECIPE_SELECT =
  'id, household_id, name, ingredients, steps, serves, notes, tags, source_url, category, is_pinned, use_count, created_at';

function mapRowToRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    household_id: row.household_id,
    name: row.name,
    ingredients: row.ingredients?.trim() || '',
    steps: row.steps?.trim() || '',
    serves: row.serves,
    notes: row.notes?.trim() || '',
    tags: row.tags ?? [],
    source_url: row.source_url?.trim() || '',
    category: row.category?.trim() || 'Family',
    is_pinned: Boolean(row.is_pinned),
    use_count: row.use_count ?? 0,
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

export async function fetchRecipes(): Promise<Recipe[]> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('recipes')
    .select(RECIPE_SELECT)
    .eq('household_id', householdId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapRowToRecipe);
}

export async function insertRecipe(input: RecipeInput): Promise<Recipe> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('recipes')
    .insert({
      household_id: householdId,
      name: input.name,
      ingredients: input.ingredients,
      steps: input.steps,
      category: input.category,
      serves: input.serves,
    })
    .select(RECIPE_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapRowToRecipe(data);
}

export async function updateRecipe(id: string, input: RecipeInput): Promise<Recipe> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('recipes')
    .update({
      name: input.name,
      ingredients: input.ingredients,
      steps: input.steps,
      category: input.category,
      serves: input.serves,
    })
    .eq('id', id)
    .eq('household_id', householdId)
    .select(RECIPE_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapRowToRecipe(data);
}

export async function deleteRecipe(id: string): Promise<void> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id)
    .eq('household_id', householdId);

  if (error) {
    throw error;
  }
}
