import { useEffect, useState } from 'react';
import {
  getHouseholdId,
  loadTodoItems,
  saveTodoItems,
} from '../../../lib/store/familyStore';
import type { TaskItem } from '../types';

export function useTodoItems() {
  const [items, setItems] = useState<TaskItem[]>(() => loadTodoItems());
  const householdId = getHouseholdId();

  useEffect(() => {
    saveTodoItems(items);
  }, [items]);

  function addItem(title: string, area = 'Family', due = 'Today') {
    const cleanTitle = title.trim();

    if (!cleanTitle) return;

    setItems((current) => [
      {
        id: crypto.randomUUID(),
        household_id: householdId,
        title: cleanTitle,
        area,
        due,
        done: false,
        created_at: new Date().toISOString(),
      },
      ...current,
    ]);
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
    addItem,
    toggleItem,
    deleteItem,
  };
}