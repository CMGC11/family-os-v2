import BackButton from '../../../ui/navigation/BackButton';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';

export default function WishlistPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Wishlist"
        title="Saved ideas"
        subtitle="Gift ideas, shared wants, useful links, and all the things people pretend they will remember later."
        right={<BackButton fallbackTo="/family" label="Family" />}
      />

      <PageShell>
        <GlassCard className="tasksCard">
          <div className="hubList">
            {['Pregnancy photoshoot · Shortlist photographers', 'Baby room · Lamp, basket, shelves', 'Date night · Restaurant ideas'].map((item) => (
              <div key={item} className="hubRow">
                <div className="hubIcon tintRose">♡</div>
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