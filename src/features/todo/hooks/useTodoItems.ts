import { useEffect, useState } from 'react';
import {
  deleteTodoItem,
  fetchTodoItems,
  insertTodoItem,
  updateTodoItemDone,
} from '../services/todoSupabaseService';
import type { TaskItem } from '../types';

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

  async function addItem(title: string, area = 'Family', due = 'Today') {
    const cleanTitle = title.trim();

    if (!cleanTitle) return;

    try {
      setErrorMessage('');

      const row = await insertTodoItem(cleanTitle, area, due);

      const newItem: TaskItem = {
        id: row.id,
        household_id: row.household_id,
        title: row.title,
        area: row.area || 'Family',
        due: row.due || 'Today',
        done: Boolean(row.is_done),
        created_at: row.created_at ?? new Date().toISOString(),
      };

      setItems((current) => [newItem, ...current]);
    } catch (error) {
      console.error('Failed to insert todo item:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add task.');
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
    toggleItem,
    deleteItem,
  };
}