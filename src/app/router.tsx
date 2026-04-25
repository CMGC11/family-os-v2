import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShell from './AppShell';

import HomePage from '../features/home/pages/HomePage';
import CalendarPage from '../features/calendar/pages/CalendarPage';
import TodoPage from '../features/todo/pages/TodoPage';
import FamilyHubPage from '../features/family/pages/FamilyHubPage';

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
    ],
  },
]);