import { useWishlistItems } from '../hooks/useWishlistItems';
import BackButton from '../../../ui/navigation/BackButton';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';

export default function WishlistPage() {
  const { items, isLoading, errorMessage } = useWishlistItems();

  return (
    <main>
      <PageHeader
        eyebrow="Wishlist"
        title="Saved ideas"
        subtitle="Gift ideas, shared wants, useful links, and all the things people pretend they will remember later."
        right={<BackButton fallbackTo="/family" label="Family" />}
      />

      <PageShell>
        {isLoading && (
          <GlassCard className="tasksCard">
            <p className="mutedLabel">Loading wishlist...</p>
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
                  <div className="hubIcon tintRose">♡</div>
                  <div>
                    <strong>No saved ideas</strong>
                    <span>Suspiciously restrained. Add one later.</span>
                  </div>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="hubRow">
                    <div className="hubIcon tintRose">♡</div>

                    <div>
                      <strong>{item.title}</strong>
                      <span>
                        {item.occasion || item.priority}
                        {item.note ? ` · ${item.note}` : ''}
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