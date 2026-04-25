import { useFamilyStore } from '../../../lib/store/useFamilyStore';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';

export default function GroceryPage() {
  const { grocery, toggleItem } = useFamilyStore();

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
            {grocery.map((item) => (
              <button
                key={item.id}
                className="hubRow"
                onClick={() => toggleItem(item.id)}
              >
                <div className="hubIcon tintLime">
                  {item.checked ? '✓' : '◌'}
                </div>

                <div>
                  <strong>{item.name}</strong>
                  <span>{item.category}</span>
                </div>

                <span className="chevron">›</span>
              </button>
            ))}
          </div>
        </GlassCard>
      </PageShell>
    </main>
  );
}