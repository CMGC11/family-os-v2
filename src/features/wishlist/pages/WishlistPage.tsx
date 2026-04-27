import { useState } from 'react';
import { useWishlistItems } from '../hooks/useWishlistItems';
import BackButton from '../../../ui/navigation/BackButton';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';
import SectionHeader from '../../../ui/layout/SectionHeader';

export default function WishlistPage() {
  const { items, isLoading, errorMessage, addItem, deleteItem } = useWishlistItems();
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  function handleAddItem() {
    const cleanTitle = title.trim();

    if (!cleanTitle) return;

    addItem(cleanTitle, note.trim());
    setTitle('');
    setNote('');
  }

  return (
    <main>
      <PageHeader
        eyebrow="Wishlist"
        title="Saved ideas"
        subtitle="Gift ideas, shared wants, useful links, and all the things people pretend they will remember later."
        right={<BackButton fallbackTo="/family" label="Family" />}
      />

      <PageShell>
        <GlassCard className="moduleCreateCard">
          <div className="moduleCreateForm moduleCreateFormThree">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleAddItem();
              }}
              placeholder="Add idea"
              aria-label="Wishlist item title"
            />

            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleAddItem();
              }}
              placeholder="Note"
              aria-label="Wishlist item note"
            />

            <button type="button" onClick={handleAddItem} disabled={!title.trim()}>
              Add
            </button>
          </div>
        </GlassCard>

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
          <GlassCard className="moduleListCard">
            <SectionHeader title="Ideas" />

            <div className="moduleList">
              {items.length === 0 ? (
                <div className="moduleEmptyRow">
                  <div className="moduleIcon tintRose">♡</div>
                  <div>
                    <strong>No saved ideas</strong>
                    <span>Suspiciously restrained. Add one later.</span>
                  </div>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="moduleRow">
                    <div className="moduleIcon tintRose">♡</div>

                    <div className="moduleMainText">
                      <strong>{item.title}</strong>
                      <span>
                        {item.occasion || item.priority || 'Idea'}
                        {item.note ? ` · ${item.note}` : ''}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="moduleDeleteButton"
                      onClick={() => deleteItem(item.id)}
                      aria-label={`Delete ${item.title}`}
                    >
                      ×
                    </button>
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
