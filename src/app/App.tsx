import { useState } from 'react';
import type { AppTab } from './types';
import AppShell from './AppShell';
import CalendarPage from '../features/calendar/pages/CalendarPage';
import FamilyHubPage from '../features/family/pages/FamilyHubPage';
import HomePage from '../features/home/pages/HomePage';
import TodoPage from '../features/todo/pages/TodoPage';

export default function App() {
  const [active, setActive] = useState<AppTab>('home');

  return (
    <AppShell active={active} setActive={setActive}>
      {active === 'home' && <HomePage setActive={setActive} />}
      {active === 'calendar' && <CalendarPage />}
      {active === 'todo' && <TodoPage />}
      {active === 'hub' && <FamilyHubPage />}
    </AppShell>
  );
}