import { useMedicalNotes } from '../hooks/useMedicalNotes';
import BackButton from '../../../ui/navigation/BackButton';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';

export default function HealthPage() {
  const { items, isLoading, errorMessage } = useMedicalNotes();

  return (
    <main>
      <PageHeader
        eyebrow="Health"
        title="Care notes"
        subtitle="Appointments, medication, emergency info, and the kind of details nobody remembers when needed."
        right={<BackButton fallbackTo="/family" label="Family" />}
      />

      <PageShell>
        {isLoading && (
          <GlassCard className="tasksCard">
            <p className="mutedLabel">Loading health notes...</p>
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
                  <div className="hubIcon tintGreen">+</div>
                  <div>
                    <strong>No health notes</strong>
                    <span>Good. Or undocumented. Let’s hope good.</span>
                  </div>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="hubRow">
                    <div className="hubIcon tintGreen">+</div>

                    <div>
                      <strong>{item.title}</strong>
                      <span>
                        {item.date || 'No date'}
                        {item.content ? ` · ${item.content}` : ''}
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