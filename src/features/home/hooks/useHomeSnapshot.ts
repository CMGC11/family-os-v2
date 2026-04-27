import { useEffect, useState } from 'react';
import { fetchCalendarEvents } from '../../calendar/services/calendarSupabaseService';
import { fetchGroceryItems } from '../../grocery/services/grocerySupabaseService';
import { fetchMedicalNotes } from '../../health/services/healthSupabaseService';
import { fetchRecipes } from '../../recipes/services/recipesSupabaseService';
import { fetchTodoItems } from '../../todo/services/todoSupabaseService';
import { fetchTrips } from '../../trips/services/tripsSupabaseService';
import { fetchWishlistItems } from '../../wishlist/services/wishlistSupabaseService';

type HomeCalendarItem = {
  id: string;
  title: string;
  date: string;
  time: string;
};

type HomeTodoItem = {
  id: string;
  title: string;
  done: boolean;
  due: string;
};

type HomeSnapshot = {
  groceryOpenCount: number;
  todoOpenCount: number;
  calendarEventCount: number;
  todayCalendarCount: number;
  wishlistCount: number;
  healthNoteCount: number;
  recipeCount: number;
  tripCount: number;
  calendar: HomeCalendarItem[];
  todayCalendar: HomeCalendarItem[];
  upcomingCalendar: HomeCalendarItem[];
  todo: HomeTodoItem[];
  isLoading: boolean;
  errorMessage: string;
};

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getTodayDateString() {
  return toDateString(new Date());
}

async function loadHomeSnapshot(): Promise<Omit<HomeSnapshot, 'isLoading' | 'errorMessage'>> {
  const today = getTodayDateString();

  const [grocery, todo, calendar, wishlist, healthNotes, recipes, trips] = await Promise.all([
    fetchGroceryItems(),
    fetchTodoItems(),
    fetchCalendarEvents(),
    fetchWishlistItems(),
    fetchMedicalNotes(),
    fetchRecipes(),
    fetchTrips(),
  ]);

  const openTodo = todo.filter((item) => !item.done);
  const openGrocery = grocery.filter((item) => !item.checked);
  const todayCalendar = calendar.filter((event) => event.date === today);
  const upcomingCalendar = calendar.filter((event) => event.date >= today).slice(0, 5);
  const upcomingTrips = trips.filter((trip) => trip.start_date >= today);

  return {
    groceryOpenCount: openGrocery.length,
    todoOpenCount: openTodo.length,
    calendarEventCount: upcomingCalendar.length,
    todayCalendarCount: todayCalendar.length,
    wishlistCount: wishlist.length,
    healthNoteCount: healthNotes.length,
    recipeCount: recipes.length,
    tripCount: upcomingTrips.length,
    calendar: calendar.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      time: event.time,
    })),
    todayCalendar: todayCalendar.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      time: event.time,
    })),
    upcomingCalendar: upcomingCalendar.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      time: event.time,
    })),
    todo: openTodo.map((task) => ({
      id: task.id,
      title: task.title,
      done: task.done,
      due: task.due,
    })),
  };
}

export function useHomeSnapshot() {
  const [snapshot, setSnapshot] = useState<HomeSnapshot>({
    groceryOpenCount: 0,
    todoOpenCount: 0,
    calendarEventCount: 0,
    todayCalendarCount: 0,
    wishlistCount: 0,
    healthNoteCount: 0,
    recipeCount: 0,
    tripCount: 0,
    calendar: [],
    todayCalendar: [],
    upcomingCalendar: [],
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