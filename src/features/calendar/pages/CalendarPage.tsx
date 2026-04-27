import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCalendarItems } from '../hooks/useCalendarItems';
import type { CalendarEvent } from '../types';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';

type MonthDay = {
  date: Date;
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
};

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function createLocalDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getTodayDateString() {
  return toDateString(new Date());
}

function getMonthTitle(date: Date) {
  return date.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

function getMonthHeaderTitle(date: Date) {
  return date.toLocaleDateString('en-GB', {
    month: 'long',
  });
}

function formatSelectedDayLabel(dateString: string) {
  const date = createLocalDate(dateString);

  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatShortDateLabel(dateString: string) {
  const date = createLocalDate(dateString);

  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function getMondayBasedStartOffset(date: Date) {
  const day = date.getDay();

  return day === 0 ? 6 : day - 1;
}

function buildMonthDays(viewMonth: Date): MonthDay[] {
  const year = viewMonth.getFullYear();
  const monthIndex = viewMonth.getMonth();
  const firstDayOfMonth = new Date(year, monthIndex, 1, 12, 0, 0, 0);
  const startOffset = getMondayBasedStartOffset(firstDayOfMonth);
  const daysInCurrentMonth = getDaysInMonth(year, monthIndex);
  const daysInPreviousMonth = getDaysInMonth(year, monthIndex - 1);
  const days: MonthDay[] = [];

  for (let index = startOffset - 1; index >= 0; index -= 1) {
    const dayNumber = daysInPreviousMonth - index;
    const date = new Date(year, monthIndex - 1, dayNumber, 12, 0, 0, 0);

    days.push({
      date,
      dateString: toDateString(date),
      dayNumber,
      isCurrentMonth: false,
    });
  }

  for (let dayNumber = 1; dayNumber <= daysInCurrentMonth; dayNumber += 1) {
    const date = new Date(year, monthIndex, dayNumber, 12, 0, 0, 0);

    days.push({
      date,
      dateString: toDateString(date),
      dayNumber,
      isCurrentMonth: true,
    });
  }

  const remainingDays = 42 - days.length;

  for (let dayNumber = 1; dayNumber <= remainingDays; dayNumber += 1) {
    const date = new Date(year, monthIndex + 1, dayNumber, 12, 0, 0, 0);

    days.push({
      date,
      dateString: toDateString(date),
      dayNumber,
      isCurrentMonth: false,
    });
  }

  return days;
}

function sortEventsByTime(events: CalendarEvent[]) {
  return [...events].sort((a, b) => a.time.localeCompare(b.time));
}

export default function CalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    events,
    selectedDayEvents,
    selectedDate,
    setSelectedDate,
    isLoading,
    errorMessage,
    addEvent,
    deleteEvent,
  } = useCalendarItems();

  const [viewMonth, setViewMonth] = useState(() => {
    const selected = createLocalDate(selectedDate);

    return new Date(selected.getFullYear(), selected.getMonth(), 1, 12, 0, 0, 0);
  });

  const [title, setTitle] = useState('');
  const [time, setTime] = useState('12:00');
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  const isCreating = searchParams.get('create') === 'event';
  const todayDateString = getTodayDateString();

  const monthDays = useMemo(() => buildMonthDays(viewMonth), [viewMonth]);

  const eventsByDate = useMemo(() => {
    const groupedEvents = new Map<string, CalendarEvent[]>();

    events.forEach((event) => {
      const currentEvents = groupedEvents.get(event.date) ?? [];
      groupedEvents.set(event.date, [...currentEvents, event]);
    });

    groupedEvents.forEach((dateEvents, date) => {
      groupedEvents.set(date, sortEventsByTime(dateEvents));
    });

    return groupedEvents;
  }, [events]);

  const currentMonthTitle = getMonthTitle(viewMonth);
  const headerMonthTitle = getMonthHeaderTitle(viewMonth);

  function setCreateFormOpen(open: boolean) {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (open) {
      nextSearchParams.set('create', 'event');
    } else {
      nextSearchParams.delete('create');
    }

    setSearchParams(nextSearchParams, { replace: true });
  }

  function openCreateForm() {
    setCreateFormOpen(true);
  }

  function closeCreateForm() {
    setCreateFormOpen(false);
    setTitle('');
    setTime('12:00');
  }

  function selectDate(dateString: string) {
    const nextDate = createLocalDate(dateString);

    setSelectedDate(dateString);
    setViewMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1, 12, 0, 0, 0));
  }

  function moveMonth(direction: -1 | 1) {
    setViewMonth((currentMonth) => {
      const nextMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + direction,
        1,
        12,
        0,
        0,
        0,
      );

      const currentSelectedDate = createLocalDate(selectedDate);
      const preferredDay = currentSelectedDate.getDate();
      const nextMonthLastDay = getDaysInMonth(nextMonth.getFullYear(), nextMonth.getMonth());
      const nextSelectedDate = new Date(
        nextMonth.getFullYear(),
        nextMonth.getMonth(),
        Math.min(preferredDay, nextMonthLastDay),
        12,
        0,
        0,
        0,
      );

      setSelectedDate(toDateString(nextSelectedDate));

      return nextMonth;
    });
  }

  function goToToday() {
    const today = new Date();
    const todayString = toDateString(today);

    setSelectedDate(todayString);
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1, 12, 0, 0, 0));
  }

  async function handleAddEvent() {
    const cleanTitle = title.trim();

    if (!cleanTitle || isSavingEvent) return;

    setIsSavingEvent(true);

    const wasAdded = await addEvent(cleanTitle, time);

    setIsSavingEvent(false);

    if (wasAdded) {
      closeCreateForm();
    }
  }

  return (
    <main>
      <PageHeader
        eyebrow="Calendar"
        title={headerMonthTitle}
        subtitle="A clean monthly view with real household events and a focused agenda below."
      />

      <PageShell>
        {isCreating && (
          <GlassCard className="calendarCreateCard">
            <div className="calendarCreateHeaderClean">
              <div>
                <p>New event</p>
                <h2>{formatSelectedDayLabel(selectedDate)}</h2>
              </div>

              <button type="button" onClick={closeCreateForm}>
                Cancel
              </button>
            </div>

            <div className="calendarCreateFormClean">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleAddEvent();
                }}
                placeholder="Event title"
                autoFocus
                aria-label="New event title"
              />

              <input
                value={time}
                onChange={(event) => setTime(event.target.value)}
                type="time"
                aria-label="New event time"
              />

              <button type="button" onClick={handleAddEvent} disabled={!title.trim() || isSavingEvent}>
                {isSavingEvent ? 'Saving...' : 'Add'}
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

        <GlassCard className="calendarMonthCard">
          <div className="calendarMonthHeader">
            <div>
              <p>Month</p>
              <h2>{currentMonthTitle}</h2>
            </div>

            <div className="calendarMonthControls">
              <button type="button" onClick={goToToday}>
                Today
              </button>
              <button type="button" onClick={() => moveMonth(-1)} aria-label="Previous month">
                ‹
              </button>
              <button type="button" onClick={() => moveMonth(1)} aria-label="Next month">
                ›
              </button>
            </div>
          </div>

          <div className="calendarWeekLabels">
            {WEEK_LABELS.map((label, index) => (
              <div key={`${label}-${index}`}>{label}</div>
            ))}
          </div>

          <div className="calendarMonthGrid">
            {monthDays.map((day) => {
              const dayEvents = eventsByDate.get(day.dateString) ?? [];
              const isSelected = selectedDate === day.dateString;
              const isToday = todayDateString === day.dateString;
              const visibleDots = dayEvents.slice(0, 3);

              return (
                <button
                  key={day.dateString}
                  type="button"
                  className={[
                    'calendarDayCell',
                    !day.isCurrentMonth ? 'calendarDayCellMuted' : '',
                    isSelected ? 'calendarDayCellSelected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => selectDate(day.dateString)}
                  aria-label={`${formatSelectedDayLabel(day.dateString)}${
                    dayEvents.length > 0
                      ? `, ${dayEvents.length} event${dayEvents.length === 1 ? '' : 's'}`
                      : ', no events'
                  }`}
                >
                  <span
                    className={[
                      'calendarDayNumber',
                      isSelected ? 'calendarDayNumberSelected' : '',
                      isToday && !isSelected ? 'calendarDayNumberToday' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {day.dayNumber}
                  </span>

                  <span className="calendarEventDots" aria-hidden="true">
                    {visibleDots.map((event, eventIndex) => (
                      <span
                        key={event.id}
                        className={[
                          'calendarEventDot',
                          eventIndex === 1 ? 'calendarEventDotGreen' : '',
                          eventIndex === 2 ? 'calendarEventDotAmber' : '',
                          !day.isCurrentMonth ? 'calendarEventDotMuted' : '',
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
        </GlassCard>

        {!isLoading && !errorMessage && (
          <GlassCard className="calendarAgendaCard">
            <div className="calendarAgendaHeader">
              <div>
                <p>Selected day</p>
                <h2>{formatSelectedDayLabel(selectedDate)}</h2>
              </div>

              <button type="button" onClick={openCreateForm}>
                New
              </button>
            </div>

            <div className="calendarAgendaList">
              {selectedDayEvents.length === 0 ? (
                <div className="calendarAgendaEmptyRow">
                  <span className="calendarAgendaEmptyIcon" aria-hidden="true" />
                  <div>
                    <strong>No events</strong>
                    <p>Quiet day. Suspicious, but welcome.</p>
                  </div>
                </div>
              ) : (
                selectedDayEvents.map((event) => (
                  <div key={event.id} className="calendarAgendaRow">
                    <span className="calendarAgendaTime">{event.time}</span>

                    <div className="calendarAgendaText">
                      <strong>{event.title}</strong>
                      <p>{formatShortDateLabel(event.date)}</p>
                    </div>

                    <button
                      type="button"
                      className="calendarAgendaDeleteButton"
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
