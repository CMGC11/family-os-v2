import type { ReactNode } from 'react';
import type { AppTab } from './types';
import BottomNav from '../ui/navigation/BottomNav';

type AppShellProps = {
  children: ReactNode;
  active: AppTab;
  setActive: (tab: AppTab) => void;
};

export default function AppShell({ children, active, setActive }: AppShellProps) {
  return (
    <div className="appRoot">
      <div className="phoneShell">
        <div className="screen">
          <div className="topGlow" />
          <div className="pageContent">{children}</div>
          <BottomNav active={active} setActive={setActive} />
        </div>
      </div>
    </div>
  );
}