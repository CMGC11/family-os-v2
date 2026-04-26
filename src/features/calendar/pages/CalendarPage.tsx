import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCalendarItems } from '../hooks/useCalendarItems';
import { monthDays } from '../../../data/mockFamilyData';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';

function formatSelectedDayLabel(dateString: string) {
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
  });
}

export default function CalendarPage() {
  const [searchParams] = useSearchParams();
  const {
    selectedDayEvents,
    selectedDate,
    setSelectedDate,
    isLoading,
    errorMessage,
    addEvent,
    deleteEvent,
  } = useCalendarItems();

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
              <button type="button" onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}>
                Today
              </button>

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
                const dayNumber = String(day.date).padStart(2, '0');
                const dateString = `2026-04-${dayNumber}`;
                const isSelected = selectedDate === dateString;
                const isToday = day.today;
                const hasEvents = day.events.length > 0;

                return (
                  <button
                    key={`${day.date}-${index}`}
                    type="button"
                    className="dayCell"
                    onClick={() => {
                      if (!day.muted) {
                        setSelectedDate(dateString);
                      }
                    }}
                  >
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
                <h2>{formatSelectedDayLabel(selectedDate)}</h2>
              </div>

              <button type="button">New</button>
            </div>

            <div className="agendaList">
              {selectedDayEvents.length === 0 ? (
                <div className="agendaRow">
                  <div className="agendaAccent accent0" />

                  <div>
                    <strong>No events</strong>
                    <span>Quiet day. Suspicious, but welcome.</span>
                  </div>
                </div>
              ) : (
                selectedDayEvents.map((event, index) => (
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
                ))
              )}
            </div>
          </GlassCard>
        )}
      </PageShell>
    </main>
  );
}