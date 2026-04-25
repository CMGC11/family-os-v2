import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShell from './AppShell';

import CalendarPage from '../features/calendar/pages/CalendarPage';
import FamilyHubPage from '../features/family/pages/FamilyHubPage';
import GroceryPage from '../features/grocery/pages/GroceryPage';
import HealthPage from '../features/health/pages/HealthPage';
import HomePage from '../features/home/pages/HomePage';
import RecipesPage from '../features/recipes/pages/RecipesPage';
import TodoPage from '../features/todo/pages/TodoPage';
import TripsPage from '../features/trips/pages/TripsPage';
import WishlistPage from '../features/wishlist/pages/WishlistPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },

      { path: 'home', element: <HomePage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'todo', element: <TodoPage /> },
      { path: 'family', element: <FamilyHubPage /> },

      { path: 'family/grocery', element: <GroceryPage /> },
      { path: 'family/health', element: <HealthPage /> },
      { path: 'family/recipes', element: <RecipesPage /> },
      { path: 'family/trips', element: <TripsPage /> },
      { path: 'family/wishlist', element: <WishlistPage /> },
    ],
  },
]);