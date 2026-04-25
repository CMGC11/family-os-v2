import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import BottomNav from '../ui/navigation/BottomNav';

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();

  const active = location.pathname.replace('/', '') || 'home';

  return (
    <div className="appRoot">
      <div className="phoneShell">
        <div className="screen">
          <div className="topGlow" />
          <div className="pageContent">
            <Outlet />
          </div>

          <BottomNav
            active={active as any}
            setActive={(tab) => navigate(`/${tab === 'hub' ? 'family' : tab}`)}
          />
        </div>
      </div>
    </div>
  );
}