import { useEffect, useState } from 'react';
import {
  deleteTodoItem,
  fetchTodoItems,
  insertTodoItem,
  updateTodoItem,
  updateTodoItemDone,
} from '../services/todoSupabaseService';
import { requireSupabaseClient } from '../../../lib/supabase/client';
import { getCurrentHouseholdId } from '../../../lib/supabase/household';
import type { TaskItem } from '../types';

type TodoInput = {
  title: string;
  area?: string;
  due?: string;
};

function cleanTodoInput(input: TodoInput) {
  return {
    title: input.title.trim(),
    area: input.area?.trim() || 'Family',
    due: input.due?.trim() || 'Today',
  };
}

export function useTodoItems() {
  const [items, setItems] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const nextItems = await fetchTodoItems();

        if (!cancelled) {
          setItems(nextItems);
        }
      } catch (error) {
        console.error('Failed to load todo items:', error);

        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : 'Failed to load todo items.');
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
          .channel(`todo-items-realtime-${householdId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'todo_items',
              filter: `household_id=eq.${householdId}`,
            },
            async () => {
              try {
                const nextItems = await fetchTodoItems();
                setItems(nextItems);
              } catch (error) {
                console.error('Failed to refresh todo items after realtime event:', error);
                setErrorMessage(error instanceof Error ? error.message : 'Failed to sync todo items.');
              }
            },
          )
          .subscribe();
      } catch (error) {
        console.error('Failed to subscribe to todo realtime:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to subscribe to todo sync.');
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

  async function addItem(input: TodoInput): Promise<TaskItem | null> {
    const cleanInput = cleanTodoInput(input);

    if (!cleanInput.title) return null;

    try {
      setErrorMessage('');

      const newItem = await insertTodoItem(cleanInput.title, cleanInput.area, cleanInput.due);

      setItems((current) => [newItem, ...current.filter((item) => item.id !== newItem.id)]);

      return newItem;
    } catch (error) {
      console.error('Failed to insert todo item:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add task.');
      return null;
    }
  }

  async function editItem(id: string, input: TodoInput): Promise<TaskItem | null> {
    const cleanInput = cleanTodoInput(input);

    if (!cleanInput.title) return null;

    try {
      setErrorMessage('');

      const updatedItem = await updateTodoItem(id, cleanInput);

      setItems((current) =>
        current.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      );

      return updatedItem;
    } catch (error) {
      console.error('Failed to edit todo item:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to edit task.');
      return null;
    }
  }

  async function toggleItem(id: string) {
    const target = items.find((item) => item.id === id);

    if (!target) return;

    const nextDone = !target.done;

    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, done: nextDone } : item,
      ),
    );

    try {
      setErrorMessage('');
      await updateTodoItemDone(id, nextDone);
    } catch (error) {
      console.error('Failed to update todo item:', error);

      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, done: target.done } : item,
        ),
      );

      setErrorMessage(error instanceof Error ? error.message : 'Failed to update task.');
    }
  }

  async function deleteItem(id: string) {
    const previousItems = items;

    setItems((current) => current.filter((item) => item.id !== id));

    try {
      setErrorMessage('');
      await deleteTodoItem(id);
    } catch (error) {
      console.error('Failed to delete todo item:', error);

      setItems(previousItems);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete task.');
    }
  }

  return {
    items,
    isLoading,
    errorMessage,
    addItem,
    editItem,
    toggleItem,
    deleteItem,
  };
}
