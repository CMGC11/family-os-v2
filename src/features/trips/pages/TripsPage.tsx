import { useState } from 'react';
import { useTrips } from '../hooks/useTrips';
import BackButton from '../../../ui/navigation/BackButton';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';

export default function TripsPage() {
  const { items, isLoading, errorMessage, addItem } = useTrips();
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  function handleAddItem() {
    addItem({
      title,
      destination,
      start_date: startDate,
      end_date: endDate,
    });

    setTitle('');
    setDestination('');
    setStartDate('');
    setEndDate('');
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
        <GlassCard className="quickCreateCard">
          <div className="tripCreateForm">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Trip title"
              aria-label="Trip title"
            />

            <input
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
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

            <button type="button" onClick={handleAddItem}>
              Add
            </button>
          </div>
        </GlassCard>

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
          <GlassCard className="tasksCard">
            <div className="hubList">
              {items.length === 0 ? (
                <div className="hubRow">
                  <div className="hubIcon tintBlue">✈</div>
                  <div>
                    <strong>No trips yet</strong>
                    <span>Home wins by default. Suspiciously economical.</span>
                  </div>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="hubRow">
                    <div className="hubIcon tintBlue">✈</div>

                    <div>
                      <strong>{item.title}</strong>
                      <span>
                        {item.destination || 'No destination'} · {item.start_date} → {item.end_date}
                      </span>
                    </div>

                    <span className="chevron">›</span>
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