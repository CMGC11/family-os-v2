import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCalendarItems } from '../hooks/useCalendarItems';
import { monthDays } from '../../../data/mockFamilyData';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';

export default function CalendarPage() {
  const [searchParams] = useSearchParams();
  const { selectedDayEvents, isLoading, errorMessage, addEvent, deleteEvent } = useCalendarItems();
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('12:00');

  const isCreating = searchParams.get('create') === 'event';
  const weekLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  function handleAddEvent() {
    addEvent(title, time);
    setTitle('');
    setTime('12:00');
  }

  return (
    <main>
      <PageHeader
        eyebrow="Calendar"
        title="April"
        subtitle="A familiar Apple-style monthly view: clean grid, quiet event indicators, and the selected day’s agenda below."
      />

      <PageShell>
        {isCreating && (
          <GlassCard className="quickCreateCard">
            <div className="calendarCreateForm">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleAddEvent();
                }}
                placeholder="New event title..."
                autoFocus
                aria-label="New event title"
              />

              <input
                value={time}
                onChange={(event) => setTime(event.target.value)}
                type="time"
                aria-label="New event time"
              />

              <button type="button" onClick={handleAddEvent}>
                Add
              </button>
            </div>
          </GlassCard>
        )}

        {isLoading && (
          <GlassCard className="tasksCard">
            <p className="mutedLabel">Loading calendar...</p>
          </GlassCard>
        )}

        {errorMessage && (
          <GlassCard className="tasksCard">
            <p className="mutedLabel">{errorMessage}</p>
          </GlassCard>
        )}

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

        {!isLoading && !errorMessage && (
          <GlassCard className="agendaCard">
            <div className="agendaHeader">
              <div>
                <p>Selected day</p>
                <h2>Thursday 24</h2>
              </div>

              <button type="button">New</button>
            </div>

            <div className="agendaList">
              {selectedDayEvents.map((event, index) => (
                <div key={event.id} className="agendaRow">
                  <div className={`agendaAccent accent${index % 3}`} />

                  <div>
                    <strong>{event.title}</strong>
                    <span>{event.time}</span>
                  </div>

                  <button
                    type="button"
                    className="agendaDeleteButton"
                    onClick={() => deleteEvent(event.id)}
                    aria-label={`Delete ${event.title}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </PageShell>
    </main>
  );
}