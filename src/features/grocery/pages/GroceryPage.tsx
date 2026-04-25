import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';

export default function GroceryPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Grocery"
        title="Shopping list"
        subtitle="Grouped shopping execution without turning groceries into a project management ritual."
      />

      <PageShell>
        <GlassCard className="tasksCard">
          <div className="hubList">
            {['Produce · Bananas, apples, lettuce', 'Dairy · Oat milk, yogurt', 'Baby · Diapers, wipes'].map((item) => (
              <div key={item} className="hubRow">
                <div className="hubIcon tintLime">◌</div>
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