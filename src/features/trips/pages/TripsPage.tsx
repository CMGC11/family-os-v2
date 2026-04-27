import { useTrips } from '../hooks/useTrips';
import BackButton from '../../../ui/navigation/BackButton';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';

export default function TripsPage() {
  const { items, isLoading, errorMessage } = useTrips();

  return (
    <main>
      <PageHeader
        eyebrow="Trips"
        title="Trips"
        subtitle="Packing, itinerary, documents, and all the tiny logistics that reproduce in the dark."
        right={<BackButton fallbackTo="/family" label="Family" />}
      />

      <PageShell>
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