import { useMemo, useState } from 'react';
import { useWishlistItems } from '../hooks/useWishlistItems';
import type { WishlistItem } from '../types';
import BackButton from '../../../ui/navigation/BackButton';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';
import SectionHeader from '../../../ui/layout/SectionHeader';

function formatCreatedDate(dateString: string) {
  if (!dateString) return 'Unknown';

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return 'Unknown';

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getWishlistMeta(item: WishlistItem) {
  const parts = [item.occasion, item.priority].filter(Boolean);

  if (parts.length === 0) return 'Idea';

  return parts.join(' · ');
}

function getWishlistSummary(item: WishlistItem) {
  if (item.note.trim()) return item.note.trim();
  if (item.link.trim()) return item.link.trim();

  return 'No note added yet.';
}

function getPriorityLabel(priority: string) {
  if (!priority.trim()) return 'Medium';

  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export default function WishlistPage() {
  const { items, isLoading, errorMessage, addItem, deleteItem } = useWishlistItems();
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [selectedWishId, setSelectedWishId] = useState<string | null>(null);

  const selectedWish = useMemo(() => {
    if (items.length === 0) return null;

    return items.find((item) => item.id === selectedWishId) ?? items[0];
  }, [items, selectedWishId]);

  function handleAddItem() {
    const cleanTitle = title.trim();

    if (!cleanTitle) return;

    addItem(cleanTitle, note.trim());
    setTitle('');
    setNote('');
  }

  function handleDeleteItem(item: WishlistItem) {
    if (selectedWishId === item.id) {
      setSelectedWishId(null);
    }

    deleteItem(item.id);
  }

  return (
    <main>
      <PageHeader
        eyebrow="Wishlist"
        title="Saved ideas"
        subtitle="Gift ideas, shared wants, useful links, and all the things people pretend they will remember later. They will not."
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
                items.map((item) => {
                  const isSelected = selectedWish?.id === item.id;

                  return (
                    <div key={item.id} className={`moduleRow ${isSelected ? 'wishlistRowSelected' : ''}`}>
                      <div className="moduleIcon tintRose">♡</div>

                      <button
                        type="button"
                        className="moduleMainButton"
                        onClick={() => setSelectedWishId(item.id)}
                        aria-label={`Open ${item.title}`}
                      >
                        <strong>{item.title}</strong>
                        <span>
                          {getWishlistMeta(item)}
                          {item.note ? ` · ${item.note}` : ''}
                        </span>
                      </button>

                      <button
                        type="button"
                        className="moduleDeleteButton"
                        onClick={() => handleDeleteItem(item)}
                        aria-label={`Delete ${item.title}`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>
        )}

        {!isLoading && !errorMessage && selectedWish && (
          <GlassCard className="wishlistDetailCard">
            <div className="wishlistDetailHeader">
              <div>
                <p>Selected idea</p>
                <h2>{selectedWish.title}</h2>
                <span>{getWishlistMeta(selectedWish)}</span>
              </div>

              <div className="wishlistDetailIcon" aria-hidden="true">
                ♡
              </div>
            </div>

            <div className="wishlistDetailMetaGrid">
              <div>
                <span>Priority</span>
                <strong>{getPriorityLabel(selectedWish.priority)}</strong>
              </div>

              <div>
                <span>Occasion</span>
                <strong>{selectedWish.occasion || 'Anytime'}</strong>
              </div>

              <div>
                <span>Created</span>
                <strong>{formatCreatedDate(selectedWish.created_at)}</strong>
              </div>
            </div>

            <div className="wishlistDetailSection">
              <p>Note</p>
              <div className="wishlistDetailText">{getWishlistSummary(selectedWish)}</div>
            </div>

            {selectedWish.link && (
              <a
                className="wishlistDetailLink"
                href={selectedWish.link}
                target="_blank"
                rel="noreferrer"
              >
                Open saved link
              </a>
            )}
          </GlassCard>
        )}
      </PageShell>
    </main>
  );
}
