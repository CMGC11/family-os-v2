import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCalendarItems } from '../hooks/useCalendarItems';
import type { CalendarEvent, CalendarEventInput } from '../types';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';

type MonthDay = {
  date: Date;
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
};

type CalendarWeek = {
  key: string;
  days: MonthDay[];
};

type MultiDayWeekSegment = {
  event: CalendarEvent;
  startIndex: number;
  endIndex: number;
  rowIndex: number;
  startsInWeek: boolean;
  endsInWeek: boolean;
  isMuted: boolean;
};

type EventFormState = {
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
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

function buildCalendarWeeks(days: MonthDay[]): CalendarWeek[] {
  const weeks: CalendarWeek[] = [];

  for (let index = 0; index < days.length; index += 7) {
    const weekDays = days.slice(index, index + 7);

    weeks.push({
      key: weekDays.map((day) => day.dateString).join('-'),
      days: weekDays,
    });
  }

  return weeks;
}

function getMultiDaySegmentsForWeek(events: CalendarEvent[], weekDays: MonthDay[]): MultiDayWeekSegment[] {
  const weekStart = weekDays[0]?.dateString;
  const weekEnd = weekDays[weekDays.length - 1]?.dateString;

  if (!weekStart || !weekEnd) return [];

  return events
    .filter((event) => isEventMultiDay(event))
    .filter((event) => event.date <= weekEnd && getEffectiveEndDate(event) >= weekStart)
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;

      const durationCompare = getEffectiveEndDate(b).localeCompare(getEffectiveEndDate(a));
      if (durationCompare !== 0) return durationCompare;

      return a.title.localeCompare(b.title);
    })
    .slice(0, 2)
    .map((event, rowIndex) => {
      const effectiveEndDate = getEffectiveEndDate(event);
      const startIndex = weekDays.findIndex((day) => day.dateString >= event.date && day.dateString <= effectiveEndDate);
      const reversedEndIndex = [...weekDays].reverse().findIndex((day) => day.dateString >= event.date && day.dateString <= effectiveEndDate);
      const endIndex = reversedEndIndex === -1 ? startIndex : weekDays.length - 1 - reversedEndIndex;
      const safeStartIndex = Math.max(startIndex, 0);
      const safeEndIndex = Math.max(endIndex, safeStartIndex);
      const startsInWeek = event.date >= weekStart;
      const endsInWeek = effectiveEndDate <= weekEnd;
      const isMuted = weekDays.slice(safeStartIndex, safeEndIndex + 1).every((day) => !day.isCurrentMonth);

      return {
        event,
        startIndex: safeStartIndex,
        endIndex: safeEndIndex,
        rowIndex,
        startsInWeek,
        endsInWeek,
        isMuted,
      };
    });
}

function getEffectiveEndDate(event: CalendarEvent) {
  return event.end_date || event.date;
}

function isEventMultiDay(event: CalendarEvent) {
  return getEffectiveEndDate(event) > event.date;
}

function isEventOnDate(event: CalendarEvent, dateString: string) {
  return event.date <= dateString && getEffectiveEndDate(event) >= dateString;
}

function sortEventsByTime(events: CalendarEvent[]) {
  return [...events].sort((a, b) => getEventTimeLabel(a).localeCompare(getEventTimeLabel(b)));
}

function getEventTimeLabel(event: CalendarEvent) {
  if (event.all_day) return 'All day';
  return event.start_time?.trim() || event.time || '12:00';
}

function getEventTimeRangeLabel(event: CalendarEvent) {
  if (event.all_day) return 'All day';

  const startTime = event.start_time?.trim() || event.time || '12:00';
  const endTime = event.end_time?.trim();

  return endTime ? `${startTime}–${endTime}` : startTime;
}

function createEmptyFormState(selectedDate: string): EventFormState {
  return {
    title: '',
    startDate: selectedDate,
    endDate: selectedDate,
    startTime: '12:00',
    endTime: '',
    allDay: false,
  };
}

function createFormStateFromEvent(event: CalendarEvent): EventFormState {
  return {
    title: event.title,
    startDate: event.date,
    endDate: getEffectiveEndDate(event),
    startTime: event.start_time?.trim() || event.time || '12:00',
    endTime: event.end_time?.trim() || '',
    allDay: Boolean(event.all_day),
  };
}

function formStateToInput(formState: EventFormState): CalendarEventInput {
  return {
    title: formState.title,
    date: formState.startDate,
    end_date: formState.endDate || formState.startDate,
    start_time: formState.allDay ? null : formState.startTime,
    end_time: formState.allDay ? null : formState.endTime,
    all_day: formState.allDay,
  };
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
    editEvent,
    deleteEvent,
  } = useCalendarItems();

  const [viewMonth, setViewMonth] = useState(() => {
    const selected = createLocalDate(selectedDate);

    return new Date(selected.getFullYear(), selected.getMonth(), 1, 12, 0, 0, 0);
  });

  const [createForm, setCreateForm] = useState<EventFormState>(() => createEmptyFormState(selectedDate));
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EventFormState>(() => createEmptyFormState(selectedDate));
  const [isUpdatingEvent, setIsUpdatingEvent] = useState(false);

  const isCreating = searchParams.get('create') === 'event';
  const todayDateString = getTodayDateString();

  const monthDays = useMemo(() => buildMonthDays(viewMonth), [viewMonth]);
  const calendarWeeks = useMemo(() => buildCalendarWeeks(monthDays), [monthDays]);

  const eventsByDate = useMemo(() => {
    const groupedEvents = new Map<string, CalendarEvent[]>();

    monthDays.forEach((day) => {
      groupedEvents.set(day.dateString, sortEventsByTime(events.filter((event) => isEventOnDate(event, day.dateString))));
    });

    return groupedEvents;
  }, [events, monthDays]);

  const currentMonthTitle = getMonthTitle(viewMonth);
  const headerMonthTitle = getMonthHeaderTitle(viewMonth);
  const editingEvent = events.find((event) => event.id === editingEventId) ?? null;

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
    closeEditForm();
    setCreateForm(createEmptyFormState(selectedDate));
    setCreateFormOpen(true);
  }

  function closeCreateForm() {
    setCreateFormOpen(false);
    setCreateForm(createEmptyFormState(selectedDate));
  }

  function openEditForm(event: CalendarEvent) {
    setCreateFormOpen(false);
    setEditingEventId(event.id);
    setEditForm(createFormStateFromEvent(event));
  }

  function closeEditForm() {
    setEditingEventId(null);
    setEditForm(createEmptyFormState(selectedDate));
  }

  function updateCreateForm(updates: Partial<EventFormState>) {
    setCreateForm((current) => {
      const next = { ...current, ...updates };

      if (updates.startDate && next.endDate < updates.startDate) {
        next.endDate = updates.startDate;
      }

      return next;
    });
  }

  function updateEditForm(updates: Partial<EventFormState>) {
    setEditForm((current) => {
      const next = { ...current, ...updates };

      if (updates.startDate && next.endDate < updates.startDate) {
        next.endDate = updates.startDate;
      }

      return next;
    });
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
    const cleanTitle = createForm.title.trim();

    if (!cleanTitle || createForm.endDate < createForm.startDate || isSavingEvent) return;

    setIsSavingEvent(true);

    const wasAdded = await addEvent(formStateToInput(createForm));

    setIsSavingEvent(false);

    if (wasAdded) {
      closeCreateForm();
    }
  }

  async function handleUpdateEvent() {
    const cleanTitle = editForm.title.trim();

    if (!editingEventId || !cleanTitle || editForm.endDate < editForm.startDate || isUpdatingEvent) return;

    setIsUpdatingEvent(true);

    const wasUpdated = await editEvent(editingEventId, formStateToInput(editForm));

    setIsUpdatingEvent(false);

    if (wasUpdated) {
      closeEditForm();
    }
  }

  function handleDeleteEvent(eventId: string) {
    if (editingEventId === eventId) {
      closeEditForm();
    }

    deleteEvent(eventId);
  }

  function renderEventForm(
    formState: EventFormState,
    updateForm: (updates: Partial<EventFormState>) => void,
    submitLabel: string,
    isSubmitting: boolean,
    onSubmit: () => void,
  ) {
    return (
      <div className="calendarCreateFormClean calendarCreateFormFull">
        <input
          value={formState.title}
          onChange={(event) => updateForm({ title: event.target.value })}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onSubmit();
          }}
          placeholder="Event title"
          autoFocus
          aria-label="Event title"
        />

        <label className="calendarDateField">
          <span>Starts</span>
          <input
            value={formState.startDate}
            onChange={(event) => updateForm({ startDate: event.target.value })}
            type="date"
            aria-label="Event start date"
          />
        </label>

        <label className="calendarDateField">
          <span>Ends</span>
          <input
            value={formState.endDate}
            onChange={(event) => updateForm({ endDate: event.target.value })}
            min={formState.startDate}
            type="date"
            aria-label="Event end date"
          />
        </label>

        <label className="calendarToggleRow">
          <input
            checked={formState.allDay}
            onChange={(event) => updateForm({ allDay: event.target.checked })}
            type="checkbox"
          />
          <span>All-day event</span>
        </label>

        {!formState.allDay && (
          <div className="calendarTimeGrid">
            <label className="calendarDateField">
              <span>Start time</span>
              <input
                value={formState.startTime}
                onChange={(event) => updateForm({ startTime: event.target.value })}
                type="time"
                aria-label="Event start time"
              />
            </label>

            <label className="calendarDateField">
              <span>End time</span>
              <input
                value={formState.endTime}
                onChange={(event) => updateForm({ endTime: event.target.value })}
                type="time"
                aria-label="Event end time"
              />
            </label>
          </div>
        )}

        <button type="button" onClick={onSubmit} disabled={!formState.title.trim() || formState.endDate < formState.startDate || isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    );
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
                <h2>{formatSelectedDayLabel(createForm.startDate)}</h2>
              </div>

              <button type="button" onClick={closeCreateForm}>
                Cancel
              </button>
            </div>

            {renderEventForm(createForm, updateCreateForm, 'Add', isSavingEvent, handleAddEvent)}
          </GlassCard>
        )}

        {editingEvent && (
          <GlassCard className="calendarCreateCard calendarEditCard">
            <div className="calendarCreateHeaderClean">
              <div>
                <p>Edit event</p>
                <h2>{formatSelectedDayLabel(editForm.startDate)}</h2>
              </div>

              <button type="button" onClick={closeEditForm}>
                Cancel
              </button>
            </div>

            {renderEventForm(editForm, updateEditForm, 'Save', isUpdatingEvent, handleUpdateEvent)}
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

          <div className="calendarMonthGrid calendarMonthGridWeeks">
            {calendarWeeks.map((week) => {
              const weekSegments = getMultiDaySegmentsForWeek(events, week.days);

              return (
                <div key={week.key} className="calendarWeekRow">
                  {week.days.map((day) => {
                    const dayEvents = eventsByDate.get(day.dateString) ?? [];
                    const singleDayEvents = dayEvents.filter((event) => !isEventMultiDay(event));
                    const isSelected = selectedDate === day.dateString;
                    const isToday = todayDateString === day.dateString;
                    const visibleDots = singleDayEvents.slice(0, 3);

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

                        {visibleDots.length > 0 && (
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
                        )}
                      </button>
                    );
                  })}

                  {weekSegments.length > 0 && (
                    <span className="calendarWeekMultiDayLayer" aria-hidden="true">
                      {weekSegments.map((segment) => (
                        <span
                          key={`${segment.event.id}-${week.key}`}
                          className={[
                            'calendarWeekMultiDayBar',
                            segment.startsInWeek ? 'calendarWeekMultiDayBarStart' : 'calendarWeekMultiDayBarContinuesBefore',
                            segment.endsInWeek ? 'calendarWeekMultiDayBarEnd' : 'calendarWeekMultiDayBarContinuesAfter',
                            segment.isMuted ? 'calendarWeekMultiDayBarMuted' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          style={{
                            gridColumn: `${segment.startIndex + 1} / ${segment.endIndex + 2}`,
                            gridRow: `${segment.rowIndex + 1}`,
                          }}
                        >
                          {segment.startsInWeek ? segment.event.title : ''}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
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
                  <div key={event.id} className={isEventMultiDay(event) ? 'calendarAgendaRow calendarAgendaRowMultiDay' : 'calendarAgendaRow'}>
                    <span className="calendarAgendaTime">{getEventTimeRangeLabel(event)}</span>

                    <div className="calendarAgendaText">
                      <strong>{event.title}</strong>
                      <p>
                        {isEventMultiDay(event)
                          ? `${formatShortDateLabel(event.date)} – ${formatShortDateLabel(getEffectiveEndDate(event))}`
                          : formatShortDateLabel(event.date)}
                      </p>
                    </div>

                    <div className="calendarAgendaActionGroup">
                      <button
                        type="button"
                        className="calendarAgendaEditButton"
                        onClick={() => openEditForm(event)}
                        aria-label={`Edit ${event.title}`}
                      >
                        ✎
                      </button>

                      <button
                        type="button"
                        className="calendarAgendaDeleteButton"
                        onClick={() => handleDeleteEvent(event.id)}
                        aria-label={`Delete ${event.title}`}
                      >
                        ×
                      </button>
                    </div>
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
