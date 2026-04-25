import { useMemo, useState } from 'react';

type AppTab = 'home' | 'calendar' | 'todo' | 'hub';

type FamilyMember = {
  name: string;
  role: string;
  color: string;
};

type CalendarDay = {
  date: number;
  muted?: boolean;
  selected?: boolean;
  today?: boolean;
  events: string[];
};

type Task = {
  title: string;
  area: string;
  due: string;
  done: boolean;
};

type HubItem = {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  tint: string;
};

const familyMembers: FamilyMember[] = [
  { name: 'Bruno', role: 'Planning', color: 'avatarBlue' },
  { name: 'Ana', role: 'Home', color: 'avatarRose' },
  { name: 'Baby', role: 'Tiny CEO', color: 'avatarAmber' },
];

const monthDays: CalendarDay[] = [
  { date: 31, muted: true, events: [] },
  { date: 1, events: ['Rent'] },
  { date: 2, events: [] },
  { date: 3, events: ['Health'] },
  { date: 4, events: [] },
  { date: 5, events: ['Trip'] },
  { date: 6, events: [] },
  { date: 7, events: ['Grocery'] },
  { date: 8, events: [] },
  { date: 9, events: ['Recipe night'] },
  { date: 10, events: [] },
  { date: 11, events: ['Family call'] },
  { date: 12, events: [] },
  { date: 13, events: [] },
  { date: 14, events: ['Wishlist'] },
  { date: 15, events: [] },
  { date: 16, events: ['Doctor'] },
  { date: 17, events: [] },
  { date: 18, events: ['Dinner'] },
  { date: 19, events: [] },
  { date: 20, events: [] },
  { date: 21, events: ['Pediatric'] },
  { date: 22, events: [] },
  { date: 23, events: ['Dinner prep'] },
  { date: 24, selected: true, events: ['Daycare', 'Plumber'] },
  { date: 25, today: true, events: ['Movie'] },
  { date: 26, events: ['Walk', 'Pack'] },
  { date: 27, events: ['Quiet day'] },
  { date: 28, events: [] },
  { date: 29, events: ['Grocery'] },
  { date: 30, events: [] },
  { date: 1, muted: true, events: [] },
  { date: 2, muted: true, events: [] },
  { date: 3, muted: true, events: [] },
  { date: 4, muted: true, events: [] },
];

const tasks: Task[] = [
  { title: 'Confirm daycare documents', area: 'Family', due: 'Today', done: false },
  { title: 'Buy oat milk, fruit, diapers', area: 'Grocery', due: 'Today', done: false },
  { title: 'Book pregnancy photoshoot shortlist', area: 'Wishlist', due: 'Tomorrow', done: true },
  { title: 'Update travel packing list', area: 'Trips', due: 'Sat', done: false },
];

const hubItems: HubItem[] = [
  {
    key: 'wishlist',
    title: 'Wishlist',
    subtitle: 'Gift ideas, shared wants, saved links',
    icon: '♡',
    tint: 'tintRose',
  },
  {
    key: 'trips',
    title: 'Trips',
    subtitle: 'Packing, itinerary, documents',
    icon: '✈',
    tint: 'tintBlue',
  },
  {
    key: 'health',
    title: 'Health',
    subtitle: 'Notes, appointments, medication',
    icon: '+',
    tint: 'tintGreen',
  },
  {
    key: 'recipes',
    title: 'Recipes',
    subtitle: 'A calm family recipe book',
    icon: '🍳',
    tint: 'tintOrange',
  },
  {
    key: 'grocery',
    title: 'Grocery',
    subtitle: 'Grouped shopping execution',
    icon: '◌',
    tint: 'tintLime',
  },
];

const quickCards = [
  { label: 'Today', value: '4 items', detail: '2 events · 2 tasks' },
  { label: 'This week', value: '12 plans', detail: 'Mostly under control, shocking' },
  { label: 'Family', value: '3 people', detail: 'Shared household view' },
];

function Icon({ type }: { type: AppTab | 'home' | 'calendar' | 'todo' | 'hub' }) {
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

function Shell({
  children,
  active,
  setActive,
}: {
  children: React.ReactNode;
  active: AppTab;
  setActive: (tab: AppTab) => void;
}) {
  const tabs: Array<{ key: AppTab; label: string; icon: AppTab }> = [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'calendar', label: 'Calendar', icon: 'calendar' },
    { key: 'todo', label: 'To-do', icon: 'todo' },
    { key: 'hub', label: 'Family', icon: 'hub' },
  ];

  return (
    <div className="appRoot">
      <div className="phoneShell">
        <div className="screen">
          <div className="topGlow" />
          <div className="pageContent">{children}</div>

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
        </div>
      </div>
    </div>
  );
}

function PageHeader({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="pageHeader">
      <div className="headerTop">
        <div className="avatarStack" aria-label="Family members">
          {familyMembers.map((member) => (
            <div key={member.name} className={`avatar ${member.color}`} title={`${member.name} · ${member.role}`}>
              {member.name[0]}
            </div>
          ))}
        </div>

        {right ?? (
          <button type="button" className="addButton">
            + Add
          </button>
        )}
      </div>

      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="subtitle">{subtitle}</p>
    </header>
  );
}

function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`glassCard ${className}`}>{children}</section>;
}

function HomePage({ setActive }: { setActive: (tab: AppTab) => void }) {
  return (
    <main>
      <PageHeader
        eyebrow="FamilyOS"
        title="Good evening"
        subtitle="A calm command center for the tiny empire humans keep calling a household."
      />

      <section className="pageSection">
        <GlassCard className="heroCard">
          <div className="heroLayout">
            <div>
              <p className="mutedLabel">Today’s rhythm</p>
              <h2>Mostly calm</h2>
              <p>
                You have a pediatric check, groceries, and two tasks that apparently cannot complete themselves.
              </p>
            </div>

            <div className="heroIcon">⌁</div>
          </div>

          <div className="quickGrid">
            {quickCards.map((card) => (
              <div key={card.label} className="quickCard">
                <p>{card.label}</p>
                <strong>{card.value}</strong>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="splitCards">
          <button type="button" onClick={() => setActive('calendar')} className="darkActionCard">
            <p>Next event</p>
            <strong>15:30</strong>
            <span>Pediatric check</span>
          </button>

          <button type="button" onClick={() => setActive('todo')} className="lightActionCard">
            <p>Open tasks</p>
            <strong>3 left</strong>
            <span>One household, endless admin</span>
          </button>
        </div>

        <GlassCard className="hubPreview">
          <div className="sectionHeader">
            <h3>Family hub</h3>
            <button type="button" onClick={() => setActive('hub')}>
              View all
            </button>
          </div>

          <div className="hubGrid">
            {hubItems.slice(0, 4).map((item) => (
              <div key={item.key} className="miniHubCard">
                <div className={`hubIcon ${item.tint}`}>{item.icon}</div>
                <p>{item.title}</p>
                <span>{item.subtitle}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </main>
  );
}

function CalendarPage() {
  const weekLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <main>
      <PageHeader
        eyebrow="Calendar"
        title="April"
        subtitle="A familiar Apple-style monthly view: clean grid, quiet event indicators, and the selected day’s agenda below."
      />

      <section className="pageSection">
        <GlassCard className="calendarCard">
          <div className="calendarTop">
            <div className="calendarActions">
              <button type="button">Today</button>

              <div>
                <button type="button" aria-label="Previous month">
                  ‹
                </button>
                <button type="button" aria-label="Next month">
                  ›
                </button>
              </div>
            </div>

            <h2>April 2026</h2>
          </div>

          <div className="calendarBody">
            <div className="weekLabels">
              {weekLabels.map((label, index) => (
                <div key={`${label}-${index}`}>{label}</div>
              ))}
            </div>

            <div className="monthGrid">
              {monthDays.map((day, index) => {
                const isSelected = day.selected;
                const isToday = day.today;
                const hasEvents = day.events.length > 0;

                return (
                  <button key={`${day.date}-${index}`} type="button" className="dayCell">
                    <span
                      className={[
                        'dayNumber',
                        isSelected ? 'daySelected' : '',
                        isToday ? 'dayToday' : '',
                        day.muted ? 'dayMuted' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {day.date}
                    </span>

                    <span className="eventDots">
                      {hasEvents &&
                        day.events.slice(0, 3).map((event, eventIndex) => (
                          <span
                            key={`${event}-${eventIndex}`}
                            className={[
                              'eventDot',
                              day.muted ? 'dotMuted' : '',
                              isSelected ? 'dotSelected' : '',
                              eventIndex === 1 ? 'dotGreen' : '',
                              eventIndex === 2 ? 'dotAmber' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          />
                        ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="agendaCard">
          <div className="agendaHeader">
            <div>
              <p>Selected day</p>
              <h2>Thursday 24</h2>
            </div>

            <button type="button">New</button>
          </div>

          <div className="agendaList">
            {['09:00 · Daycare visit', '15:30 · Pediatric check', '18:00 · Dinner prep'].map((event, index) => (
              <div key={event} className="agendaRow">
                <div className={`agendaAccent accent${index}`} />
                <div>
                  <strong>{event.split(' · ')[1]}</strong>
                  <span>{event.split(' · ')[0]}</span>
                </div>
                <span className="chevron">›</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </main>
  );
}

function TodoPage() {
  return (
    <main>
      <PageHeader
        eyebrow="To-do"
        title="Family tasks"
        subtitle="Shared chores, household admin, and the sacred ritual of moving tasks from one day to the next."
      />

      <section className="pageSection">
        <GlassCard className="tasksCard">
          <div className="taskTabs">
            {['Today', 'Week', 'Done'].map((tab, index) => (
              <button key={tab} type="button" className={index === 0 ? 'taskTabActive' : ''}>
                {tab}
              </button>
            ))}
          </div>

          <div className="taskList">
            {tasks.map((task) => (
              <div key={task.title} className="taskRow">
                <div className={`taskCheck ${task.done ? 'taskDone' : ''}`}>✓</div>

                <div>
                  <strong className={task.done ? 'taskTextDone' : ''}>{task.title}</strong>
                  <span>
                    {task.area} · {task.due}
                  </span>
                </div>

                <span className="chevron">›</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </main>
  );
}

function HubPage() {
  const featured = useMemo(() => hubItems[1], []);

  return (
    <main>
      <PageHeader
        eyebrow="Family hub"
        title="Everything else"
        subtitle="Wishlist, trips, health, recipes, and grocery. Basically the drawer where real life throws its cables."
      />

      <section className="pageSection">
        <GlassCard className="hubPageCard">
          <div className={`featuredCard ${featured.tint}`}>
            <p>Featured</p>
            <h2>Weekend trip</h2>
            <span>Packing list, documents, route, and bookings in one calm place.</span>
          </div>

          <div className="hubList">
            {hubItems.map((item) => (
              <button key={item.key} type="button" className="hubRow">
                <div className={`hubIcon ${item.tint}`}>{item.icon}</div>

                <div>
                  <strong>{item.title}</strong>
                  <span>{item.subtitle}</span>
                </div>

                <span className="chevron">›</span>
              </button>
            ))}
          </div>
        </GlassCard>
      </section>
    </main>
  );
}

export default function App() {
  const [active, setActive] = useState<AppTab>('home');

  return (
    <Shell active={active} setActive={setActive}>
      {active === 'home' && <HomePage setActive={setActive} />}
      {active === 'calendar' && <CalendarPage />}
      {active === 'todo' && <TodoPage />}
      {active === 'hub' && <HubPage />}
    </Shell>
  );
}