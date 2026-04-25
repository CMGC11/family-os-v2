import BackButton from '../../../ui/navigation/BackButton';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';

export default function TripsPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Trips"
        title="Weekend trip"
        subtitle="Packing, itinerary, documents, and all the tiny logistics that reproduce in the dark."
        right={<BackButton fallbackTo="/family" label="Family" />}
      />

      <PageShell>
        <GlassCard className="tasksCard">
          <div className="hubList">
            {['Packing · 8 items left', 'Documents · IDs, booking, insurance', 'Itinerary · Drive, lunch, check-in'].map((item) => (
              <div key={item} className="hubRow">
                <div className="hubIcon tintBlue">✈</div>
                <div>
                  <strong>{item.split(' · ')[0]}</strong>
                  <span>{item.split(' · ')[1]}</span>
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