import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTripDetailItems } from '../hooks/useTripDetailItems';
import { useTrips } from '../hooks/useTrips';
import type { Trip } from '../types';
import BackButton from '../../../ui/navigation/BackButton';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';
import SectionHeader from '../../../ui/layout/SectionHeader';

function createLocalDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function formatDateLabel(dateString: string) {
  if (!dateString) return 'No date';

  const date = createLocalDate(dateString);

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getTripDateRange(trip: Trip) {
  if (!trip.start_date && !trip.end_date) return 'Dates not set';
  if (trip.start_date && !trip.end_date) return `From ${formatDateLabel(trip.start_date)}`;
  if (!trip.start_date && trip.end_date) return `Until ${formatDateLabel(trip.end_date)}`;

  return `${formatDateLabel(trip.start_date)} → ${formatDateLabel(trip.end_date)}`;
}

function getTripDuration(trip: Trip) {
  if (!trip.start_date || !trip.end_date) return 'Duration not set';

  const start = createLocalDate(trip.start_date);
  const end = createLocalDate(trip.end_date);
  const diff = end.getTime() - start.getTime();

  if (Number.isNaN(diff) || diff < 0) return 'Check dates';

  const days = Math.round(diff / 86_400_000) + 1;

  return `${days} day${days === 1 ? '' : 's'}`;
}

function getTripSubtitle(trip: Trip) {
  const destination = trip.destination || 'No destination';
  const dates = trip.start_date || trip.end_date ? getTripDateRange(trip) : 'Dates not set';

  return `${destination} · ${dates}`;
}

type TripChecklistItem = {
  id: string;
  name: string;
  isDone: boolean;
};

type TripChecklistSectionProps = {
  title: string;
  emptyTitle: string;
  emptyDetail: string;
  inputLabel: string;
  inputValue: string;
  progressLabel: string;
  items: TripChecklistItem[];
  onInputChange: (value: string) => void;
  onAdd: () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

function TripChecklistSection({
  title,
  emptyTitle,
  emptyDetail,
  inputLabel,
  inputValue,
  progressLabel,
  items,
  onInputChange,
  onAdd,
  onToggle,
  onDelete,
}: TripChecklistSectionProps) {
  return (
    <section className="tripChecklistSection">
      <div className="tripChecklistHeader">
        <div>
          <h3>{title}</h3>
          <p>{progressLabel}</p>
        </div>
      </div>

      <div className="tripChecklistForm">
        <input
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onAdd();
          }}
          placeholder={inputLabel}
          aria-label={inputLabel}
        />

        <button type="button" onClick={onAdd} disabled={!inputValue.trim()}>
          Add
        </button>
      </div>

      <div className="tripChecklistList">
        {items.length === 0 ? (
          <div className="tripChecklistEmptyRow">
            <div className="tripChecklistEmptyIcon">+</div>
            <div>
              <strong>{emptyTitle}</strong>
              <span>{emptyDetail}</span>
            </div>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={['tripChecklistRow', item.isDone ? 'tripChecklistRowDone' : '']
                .filter(Boolean)
                .join(' ')}
            >
              <button
                type="button"
                className={['tripChecklistCheck', item.isDone ? 'tripChecklistCheckDone' : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onToggle(item.id)}
                aria-label={`Toggle ${item.name}`}
              >
                ✓
              </button>

              <button type="button" className="tripChecklistMain" onClick={() => onToggle(item.id)}>
                <strong>{item.name}</strong>
                <span>{item.isDone ? 'Done' : 'Open'}</span>
              </button>

              <button
                type="button"
                className="tripChecklistDelete"
                onClick={() => onDelete(item.id)}
                aria-label={`Delete ${item.name}`}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default function TripsPage() {
  const { items, isLoading, errorMessage, addItem, deleteItem } = useTrips();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [newPackingName, setNewPackingName] = useState('');
  const [newPrepName, setNewPrepName] = useState('');

  const isAddSheetOpen = searchParams.get('create') === 'trip';
  const selectedTrip = items.find((item) => item.id === selectedTripId) ?? null;
  const upcomingTripsCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return items.filter((item) => item.start_date >= today).length;
  }, [items]);

  const {
    packingItems,
    prepItems,
    packingProgress,
    prepProgress,
    isLoading: isLoadingTripItems,
    errorMessage: tripItemsErrorMessage,
    addPackingItem,
    addPrepItem,
    togglePackingItem,
    togglePrepItem,
    removePackingItem,
    removePrepItem,
  } = useTripDetailItems(selectedTrip?.id ?? null);

  useEffect(() => {
    if (!selectedTripId) return;

    const stillExists = items.some((item) => item.id === selectedTripId);

    if (!stillExists) {
      setSelectedTripId(null);
    }
  }, [items, selectedTripId]);

  function resetForm() {
    setTitle('');
    setDestination('');
    setStartDate('');
    setEndDate('');
  }

  function openAddSheet() {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('create', 'trip');
    setSearchParams(nextSearchParams, { replace: true });
  }

  function closeAddSheet() {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('create');
    setSearchParams(nextSearchParams, { replace: true });
    resetForm();
  }

  function handleAddItem() {
    const cleanTitle = title.trim();

    if (!cleanTitle) return;

    addItem({
      title: cleanTitle,
      destination: destination.trim(),
      start_date: startDate,
      end_date: endDate,
    });

    closeAddSheet();
  }

  async function handleAddPackingItem() {
    const wasAdded = await addPackingItem(newPackingName);

    if (wasAdded) {
      setNewPackingName('');
    }
  }

  async function handleAddPrepItem() {
    const wasAdded = await addPrepItem(newPrepName);

    if (wasAdded) {
      setNewPrepName('');
    }
  }

  function handleDeleteTrip(id: string) {
    if (selectedTripId === id) {
      setSelectedTripId(null);
    }

    deleteItem(id);
  }

  return (
    <main>
      <PageHeader
        eyebrow="Trips"
        title="Trips"
        subtitle="Packing, prep, dates, and all the tiny logistics that reproduce in the dark. Very normal hobby, planning."
        right={<BackButton fallbackTo="/family" label="Family" />}
      />

      <PageShell>
        <GlassCard className="tripSummaryCard">
          <div>
            <p className="mutedLabel">Travel plans</p>
            <h2>{isLoading ? '—' : items.length}</h2>
            <span>
              {upcomingTripsCount} upcoming · {items.length === 1 ? '1 trip' : `${items.length} trips`}
            </span>
          </div>

          <button type="button" className="tripSummaryAction" onClick={openAddSheet} aria-label="Add trip">
            +
          </button>
        </GlassCard>

        {selectedTrip && (
          <GlassCard className="tripDetailCard">
            <div className="tripDetailTop">
              <div>
                <p>{selectedTrip.destination || 'Trip detail'}</p>
                <h2>{selectedTrip.title}</h2>
              </div>

              <button type="button" onClick={() => setSelectedTripId(null)} aria-label="Close trip detail">
                ×
              </button>
            </div>

            <div className="tripDetailStats">
              <div>
                <strong>{formatDateLabel(selectedTrip.start_date)}</strong>
                <span>Start</span>
              </div>

              <div>
                <strong>{formatDateLabel(selectedTrip.end_date)}</strong>
                <span>End</span>
              </div>

              <div>
                <strong>{getTripDuration(selectedTrip)}</strong>
                <span>Duration</span>
              </div>
            </div>

            <div className="tripDetailContent">
              <section>
                <h3>Overview</h3>
                <p>{getTripSubtitle(selectedTrip)}</p>
              </section>

              <section>
                <h3>Notes</h3>
                <p>{selectedTrip.notes || 'No notes yet. The trip is still pretending to be simple.'}</p>
              </section>

              <section>
                <h3>Accommodation</h3>
                {selectedTrip.accommodation_link ? (
                  <a href={selectedTrip.accommodation_link} target="_blank" rel="noreferrer">
                    Open accommodation link
                  </a>
                ) : (
                  <p>No accommodation link saved.</p>
                )}
              </section>
            </div>

            <div className="tripDetailDivider" />

            {isLoadingTripItems && <p className="tripDetailStatus">Loading packing and prep items...</p>}
            {tripItemsErrorMessage && <p className="tripDetailError">{tripItemsErrorMessage}</p>}

            <div className="tripChecklistGrid">
              <TripChecklistSection
                title="Packing"
                emptyTitle="No packing items"
                emptyDetail="Add passports, chargers, tiny socks, and other things humans lose."
                inputLabel="Add packing item"
                inputValue={newPackingName}
                progressLabel={`${packingProgress.packedCount}/${packingProgress.totalCount} packed`}
                items={packingItems.map((item) => ({
                  id: item.id,
                  name: item.name,
                  isDone: item.is_packed,
                }))}
                onInputChange={setNewPackingName}
                onAdd={handleAddPackingItem}
                onToggle={togglePackingItem}
                onDelete={removePackingItem}
              />

              <TripChecklistSection
                title="Prep"
                emptyTitle="No prep tasks"
                emptyDetail="Add bookings, documents, check-ins, and other logistical nonsense."
                inputLabel="Add prep task"
                inputValue={newPrepName}
                progressLabel={`${prepProgress.doneCount}/${prepProgress.totalCount} done`}
                items={prepItems.map((item) => ({
                  id: item.id,
                  name: item.name,
                  isDone: item.is_done,
                }))}
                onInputChange={setNewPrepName}
                onAdd={handleAddPrepItem}
                onToggle={togglePrepItem}
                onDelete={removePrepItem}
              />
            </div>
          </GlassCard>
        )}

        {isLoading && (
          <GlassCard className="tasksCard">
            <p className="mutedLabel">Loading trips...</p>
          </GlassCard>
        )}

        {errorMessage && (
          <GlassCard className="tasksCard">
            <p className="mutedLabel">{errorMessage}</p>
          </GlassCard>
        )}

        {!isLoading && !errorMessage && (
          <GlassCard className="moduleListCard">
            <SectionHeader
              title="Trips"
              action={
                <button type="button" onClick={openAddSheet}>
                  Add
                </button>
              }
            />

            <div className="moduleList">
              {items.length === 0 ? (
                <div className="moduleEmptyRow">
                  <div className="moduleIcon tintBlue">✈</div>
                  <div>
                    <strong>No trips yet</strong>
                    <span>Home wins by default. Suspiciously economical.</span>
                  </div>
                </div>
              ) : (
                items.map((item) => {
                  const isSelected = selectedTripId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={['moduleRow', isSelected ? 'tripRowSelected' : ''].filter(Boolean).join(' ')}
                    >
                      <div className="moduleIcon tintBlue">✈</div>

                      <button type="button" className="moduleMainButton" onClick={() => setSelectedTripId(item.id)}>
                        <strong>{item.title}</strong>
                        <span>{getTripSubtitle(item)}</span>
                      </button>

                      <button
                        type="button"
                        className="moduleDeleteButton"
                        onClick={() => handleDeleteTrip(item.id)}
                        aria-label={`Delete ${item.title}`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>
        )}
      </PageShell>

      {isAddSheetOpen && (
        <div className="tripAddSheetOverlay" onClick={closeAddSheet}>
          <section className="tripAddSheet" onClick={(event) => event.stopPropagation()}>
            <div className="tripAddSheetHandle" />

            <div className="tripAddSheetHeader">
              <div>
                <p>New trip</p>
                <h2>Add travel plan</h2>
                <span>Save the basics first. The packing chaos can happen after.</span>
              </div>

              <button type="button" onClick={closeAddSheet} aria-label="Close trip add sheet">
                ×
              </button>
            </div>

            <div className="tripAddSheetForm">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Trip title"
                aria-label="Trip title"
                autoFocus
              />

              <input
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                placeholder="Destination"
                aria-label="Trip destination"
              />

              <div className="tripAddSheetGrid">
                <label>
                  <span>Start</span>
                  <input
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    type="date"
                    aria-label="Trip start date"
                  />
                </label>

                <label>
                  <span>End</span>
                  <input
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    type="date"
                    aria-label="Trip end date"
                  />
                </label>
              </div>

              <button type="button" onClick={handleAddItem} disabled={!title.trim()}>
                Add trip
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
