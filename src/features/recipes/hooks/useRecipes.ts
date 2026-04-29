import { useEffect, useState } from 'react';
import {
  deleteRecipe,
  fetchRecipes,
  insertRecipe,
  updateRecipe,
} from '../services/recipesSupabaseService';
import { requireSupabaseClient } from '../../../lib/supabase/client';
import { getCurrentHouseholdId } from '../../../lib/supabase/household';
import type { Recipe } from '../types';

type RecipeFormInput = {
  name: string;
  ingredients: string;
  steps: string;
  category: string;
  serves: string;
};

function buildRecipePayload(input: RecipeFormInput) {
  const parsedServes = Number(input.serves);

  return {
    name: input.name.trim(),
    ingredients: input.ingredients.trim(),
    steps: input.steps.trim(),
    category: input.category.trim() || 'Family',
    serves: Number.isFinite(parsedServes) && parsedServes > 0 ? parsedServes : null,
  };
}

export function useRecipes() {
  const [items, setItems] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const nextItems = await fetchRecipes();

        if (!cancelled) {
          setItems(nextItems);
        }
      } catch (error) {
        console.error('Failed to load recipes:', error);

        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : 'Failed to load recipes.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadItems();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const supabase = requireSupabaseClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function subscribe() {
      try {
        const householdId = await getCurrentHouseholdId();

        if (cancelled) return;

        channel = supabase
          .channel(`recipes-realtime-${householdId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'recipes',
              filter: `household_id=eq.${householdId}`,
            },
            async () => {
              try {
                const nextItems = await fetchRecipes();
                setItems(nextItems);
              } catch (error) {
                console.error('Failed to refresh recipes after realtime event:', error);
                setErrorMessage(error instanceof Error ? error.message : 'Failed to sync recipes.');
              }
            },
          )
          .subscribe();
      } catch (error) {
        console.error('Failed to subscribe to recipes realtime:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to subscribe to recipe sync.');
      }
    }

    subscribe();

    return () => {
      cancelled = true;

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  async function addItem(input: RecipeFormInput): Promise<Recipe | null> {
    const payload = buildRecipePayload(input);

    if (!payload.name) return null;

    try {
      setErrorMessage('');

      const newItem = await insertRecipe(payload);

      setItems((current) => {
        const withoutDuplicate = current.filter((item) => item.id !== newItem.id);
        return [newItem, ...withoutDuplicate];
      });

      return newItem;
    } catch (error) {
      console.error('Failed to insert recipe:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add recipe.');
      return null;
    }
  }

  async function editItem(id: string, input: RecipeFormInput): Promise<Recipe | null> {
    const payload = buildRecipePayload(input);

    if (!payload.name) return null;

    const previousItems = items;

    try {
      setErrorMessage('');

      const updatedItem = await updateRecipe(id, payload);

      setItems((current) => current.map((item) => (item.id === updatedItem.id ? updatedItem : item)));

      return updatedItem;
    } catch (error) {
      console.error('Failed to update recipe:', error);
      setItems(previousItems);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update recipe.');
      return null;
    }
  }

  async function deleteItem(id: string) {
    const previousItems = items;

    setItems((current) => current.filter((item) => item.id !== id));

    try {
      setErrorMessage('');
      await deleteRecipe(id);
    } catch (error) {
      console.error('Failed to delete recipe:', error);

      setItems(previousItems);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete recipe.');
    }
  }

  return {
    items,
    isLoading,
    errorMessage,
    addItem,
    editItem,
    deleteItem,
  };
}
