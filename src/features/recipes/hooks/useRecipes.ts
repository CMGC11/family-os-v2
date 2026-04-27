import { useEffect, useState } from 'react';
import {
  deleteRecipe,
  fetchRecipes,
  insertRecipe,
} from '../services/recipesSupabaseService';
import type { Recipe } from '../types';

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

  async function addItem(input: {
    name: string;
    ingredients: string;
    steps: string;
    category: string;
    serves: string;
  }) {
    const cleanName = input.name.trim();

    if (!cleanName) return;

    const parsedServes = Number(input.serves);

    try {
      setErrorMessage('');

      const newItem = await insertRecipe({
        name: cleanName,
        ingredients: input.ingredients.trim(),
        steps: input.steps.trim(),
        category: input.category.trim() || 'Family',
        serves: Number.isFinite(parsedServes) && parsedServes > 0 ? parsedServes : null,
      });

      setItems((current) => [newItem, ...current]);
    } catch (error) {
      console.error('Failed to insert recipe:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add recipe.');
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
    deleteItem,
  };
}