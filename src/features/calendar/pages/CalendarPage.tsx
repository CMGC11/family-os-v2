import { monthDays } from '../../../data/mockFamilyData';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';

export default function CalendarPage() {
  const weekLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <main>
      <PageHeader
        eyebrow="Calendar"
        title="April"
        subtitle="A familiar Apple-style monthly view: clean grid, quiet event indicators, and the selected day’s agenda below."
      />

      <PageShell>
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
      </PageShell>
    </main>
  );
}