import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { AppTab } from './types';
import BottomNav from '../ui/navigation/BottomNav';

function getActiveTab(pathname: string): AppTab {
  const firstSegment = pathname.split('/').filter(Boolean)[0];

  if (firstSegment === 'calendar') return 'calendar';
  if (firstSegment === 'todo') return 'todo';
  if (firstSegment === 'family') return 'hub';

  return 'home';
}

function getRouteForTab(tab: AppTab) {
  if (tab === 'hub') return '/family';
  return `/${tab}`;
}

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const active = getActiveTab(location.pathname);

  return (
    <div className="appRoot">
      <div className="phoneShell">
        <div className="screen">
          <div className="topGlow" />
          <div className="pageContent">
            <Outlet />
          </div>

          <BottomNav active={active} setActive={(tab) => navigate(getRouteForTab(tab))} />
        </div>
      </div>
    </div>
  );
}