import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';

export default function RecipesPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Recipes"
        title="Recipe book"
        subtitle="A calm place for meals that worked, instead of trusting memory like an amateur."
      />

      <PageShell>
        <GlassCard className="tasksCard">
          <div className="hubList">
            {['Salmon dinner · Lemon, herbs, potatoes', 'Quick pasta · Tomato, parmesan, basil', 'Weekend pancakes · Baby-approved chaos'].map((item) => (
              <div key={item} className="hubRow">
                <div className="hubIcon tintOrange">🍳</div>
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