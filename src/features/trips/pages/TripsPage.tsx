import { useState } from 'react';
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

export default function TripsPage() {
  const { items, isLoading, errorMessage, addItem, deleteItem } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const selectedTrip = items.find((item) => item.id === selectedTripId) ?? null;

  function handleAddItem() {
    const cleanTitle = title.trim();

    if (!cleanTitle) return;

    addItem({
      title: cleanTitle,
      destination: destination.trim(),
      start_date: startDate,
      end_date: endDate,
    });

    setTitle('');
    setDestination('');
    setStartDate('');
    setEndDate('');
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
        subtitle="Packing, itinerary, documents, and all the tiny logistics that reproduce in the dark."
        right={<BackButton fallbackTo="/family" label="Family" />}
      />

      <PageShell>
        <GlassCard className="moduleCreateCard">
          <div className="moduleCreateForm moduleCreateFormTrip">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleAddItem();
              }}
              placeholder="Trip title"
              aria-label="Trip title"
            />

            <input
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleAddItem();
              }}
              placeholder="Destination"
              aria-label="Trip destination"
            />

            <input
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              type="date"
              aria-label="Trip start date"
            />

            <input
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              type="date"
              aria-label="Trip end date"
            />

            <button type="button" onClick={handleAddItem} disabled={!title.trim()}>
              Add
            </button>
          </div>
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
            <SectionHeader title="Trips" />

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
                    <div key={item.id} className={["moduleRow", isSelected ? "tripRowSelected" : ""].filter(Boolean).join(' ')}>
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
    </main>
  );
}
