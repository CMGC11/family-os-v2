import { useEffect, useState } from 'react';
import { fetchGroceryItems } from '../../grocery/services/grocerySupabaseService';
import { fetchTodoItems } from '../../todo/services/todoSupabaseService';
import { loadCalendarEvents } from '../../../lib/store/familyStore';

type HomeSnapshot = {
  groceryOpenCount: number;
  todoOpenCount: number;
  calendarEventCount: number;
  calendar: Array<{
    id: string;
    title: string;
    time: string;
  }>;
  todo: Array<{
    id: string;
    title: string;
    done: boolean;
  }>;
  isLoading: boolean;
  errorMessage: string;
};

async function loadHomeSnapshot(): Promise<Omit<HomeSnapshot, 'isLoading' | 'errorMessage'>> {
  const [grocery, todo] = await Promise.all([fetchGroceryItems(), fetchTodoItems()]);
  const calendar = loadCalendarEvents();

  return {
    groceryOpenCount: grocery.filter((item) => !item.checked).length,
    todoOpenCount: todo.filter((item) => !item.done).length,
    calendarEventCount: calendar.length,
    calendar,
    todo,
  };
}

export function useHomeSnapshot() {
  const [snapshot, setSnapshot] = useState<HomeSnapshot>({
    groceryOpenCount: 0,
    todoOpenCount: 0,
    calendarEventCount: 0,
    calendar: [],
    todo: [],
    isLoading: true,
    errorMessage: '',
  });

  useEffect(() => {
    let cancelled = false;

    async function refreshSnapshot() {
      try {
        const nextSnapshot = await loadHomeSnapshot();

        if (!cancelled) {
          setSnapshot({
            ...nextSnapshot,
            isLoading: false,
            errorMessage: '',
          });
        }
      } catch (error) {
        console.error('Failed to load home snapshot:', error);

        if (!cancelled) {
          setSnapshot((current) => ({
            ...current,
            isLoading: false,
            errorMessage: error instanceof Error ? error.message : 'Failed to load home snapshot.',
          }));
        }
      }
    }

    refreshSnapshot();

    window.addEventListener('focus', refreshSnapshot);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', refreshSnapshot);
    };
  }, []);

  return snapshot;
}