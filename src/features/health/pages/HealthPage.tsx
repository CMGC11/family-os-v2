import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';

export default function HealthPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Health"
        title="Care notes"
        subtitle="Appointments, medication, emergency info, and the kind of details nobody remembers when needed."
      />

      <PageShell>
        <GlassCard className="tasksCard">
          <div className="hubList">
            {['Emergency card · Doctors, allergies, contacts', 'Medication · No missed items', 'Appointments · Pediatric check today'].map((item) => (
              <div key={item} className="hubRow">
                <div className="hubIcon tintGreen">+</div>
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