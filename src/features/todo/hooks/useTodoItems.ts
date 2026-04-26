import { useEffect, useState } from 'react';
import { fetchTodoItems } from '../services/todoSupabaseService';
import { insertTodoItem } from '../services/todoSupabaseService';
import type { TaskItem } from '../types';

const HOUSEHOLD_ID = '11111111-1111-1111-1111-111111111111';

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

  function toggleItem(id: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
    );
  }

  function deleteItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
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