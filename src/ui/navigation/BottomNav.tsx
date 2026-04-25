import type { AppTab } from '../../app/types';

type BottomNavProps = {
  active: AppTab;
  setActive: (tab: AppTab) => void;
};

function Icon({ type }: { type: AppTab }) {
  const commonProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    className: 'navIcon',
  };

  if (type === 'home') {
    return (
      <svg {...commonProps}>
        <path d="M3.5 11.5 12 4l8.5 7.5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 10.5V20h11v-9.5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 20v-5h4v5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'calendar') {
    return (
      <svg {...commonProps}>
        <path d="M7 3.5v3M17 3.5v3M4.5 9h15" strokeWidth="1.8" strokeLinecap="round" />
        <rect x="4.5" y="5.5" width="15" height="15" rx="4" strokeWidth="1.8" />
        <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'todo') {
    return (
      <svg {...commonProps}>
        <path d="m5 12 3 3 6-7" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 7h2.5M17 12h2.5M17 17h2.5" strokeWidth="1.8" strokeLinecap="round" />
        <rect x="3.5" y="4.5" width="17" height="16" rx="5" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" strokeWidth="1.8" />
      <path d="M4.5 20c1.2-3.5 4-5.5 7.5-5.5s6.3 2 7.5 5.5" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function BottomNav({ active, setActive }: BottomNavProps) {
  const tabs: Array<{ key: AppTab; label: string; icon: AppTab }> = [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'calendar', label: 'Calendar', icon: 'calendar' },
    { key: 'todo', label: 'To-do', icon: 'todo' },
    { key: 'hub', label: 'Family', icon: 'hub' },
  ];

  return (
    <nav className="bottomNav" aria-label="Main navigation">
      <div className="bottomNavGrid">
        {tabs.map((tab) => {
          const selected = active === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className={`navButton ${selected ? 'navButtonActive' : ''}`}
            >
              <Icon type={tab.icon} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}