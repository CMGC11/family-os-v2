import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWishlistItems } from '../hooks/useWishlistItems';
import type { WishlistItem } from '../types';
import { fetchHouseholdPeople, getCurrentPersonId, type HouseholdPerson } from '../../../lib/supabase/person';
import BackButton from '../../../ui/navigation/BackButton';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';
import SectionHeader from '../../../ui/layout/SectionHeader';

const ALL_PEOPLE_FILTER = 'all';
const PRIORITY_OPTIONS = ['low', 'medium', 'high'];

type SheetMode = 'create' | 'edit';

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

function getWishlistMeta(item: WishlistItem, ownerLabel: string) {
  const parts = [ownerLabel, item.occasion, item.priority].filter(Boolean);

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

function getPersonLabel(people: HouseholdPerson[], personId: string) {
  return people.find((person) => person.id === personId)?.label ?? 'Unknown person';
}

export default function WishlistPage() {
  const { items, isLoading, errorMessage, addItem, editItem, deleteItem } = useWishlistItems();
  const [searchParams, setSearchParams] = useSearchParams();
  const [people, setPeople] = useState<HouseholdPerson[]>([]);
  const [currentPersonId, setCurrentPersonId] = useState<string | null>(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>(ALL_PEOPLE_FILTER);
  const [peopleError, setPeopleError] = useState('');
  const [isLoadingPeople, setIsLoadingPeople] = useState(true);

  const [sheetMode, setSheetMode] = useState<SheetMode>('create');
  const [editingWishId, setEditingWishId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [link, setLink] = useState('');
  const [occasion, setOccasion] = useState('');
  const [priority, setPriority] = useState('medium');
  const [formOwnerId, setFormOwnerId] = useState('');
  const [selectedWishId, setSelectedWishId] = useState<string | null>(null);

  const isAddSheetOpen = searchParams.get('create') === 'wishlist';

  useEffect(() => {
    let cancelled = false;

    async function loadPeople() {
      try {
        setIsLoadingPeople(true);
        setPeopleError('');

        const [nextPeople, nextCurrentPersonId] = await Promise.all([fetchHouseholdPeople(), getCurrentPersonId()]);

        if (!cancelled) {
          setPeople(nextPeople);
          setCurrentPersonId(nextCurrentPersonId);
          setSelectedOwnerId(nextCurrentPersonId);
          setFormOwnerId(nextCurrentPersonId);
        }
      } catch (error) {
        console.error('Failed to load household people for wishlist:', error);

        if (!cancelled) {
          setPeopleError(error instanceof Error ? error.message : 'Failed to load household people.');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPeople(false);
        }
      }
    }

    loadPeople();

    return () => {
      cancelled = true;
    };
  }, []);

  const effectiveAddOwnerId = useMemo(() => {
    if (formOwnerId) return formOwnerId;
    if (selectedOwnerId !== ALL_PEOPLE_FILTER) return selectedOwnerId;
    return currentPersonId ?? people[0]?.id ?? '';
  }, [currentPersonId, formOwnerId, people, selectedOwnerId]);

  const filteredItems = useMemo(() => {
    if (selectedOwnerId === ALL_PEOPLE_FILTER) return items;
    return items.filter((item) => item.owner_id === selectedOwnerId);
  }, [items, selectedOwnerId]);

  const selectedOwnerLabel =
    selectedOwnerId === ALL_PEOPLE_FILTER ? 'Everyone' : getPersonLabel(people, selectedOwnerId);

  const addOwnerLabel = effectiveAddOwnerId ? getPersonLabel(people, effectiveAddOwnerId) : 'current person';

  const selectedWish = useMemo(() => {
    if (filteredItems.length === 0) return null;

    return filteredItems.find((item) => item.id === selectedWishId) ?? filteredItems[0];
  }, [filteredItems, selectedWishId]);

  const editingWish = useMemo(() => {
    if (!editingWishId) return null;
    return items.find((item) => item.id === editingWishId) ?? null;
  }, [editingWishId, items]);

  const wishesWithLinks = useMemo(
    () => filteredItems.filter((item) => item.link.trim()).length,
    [filteredItems],
  );

  const isPageLoading = isLoading || isLoadingPeople;
  const pageError = errorMessage || peopleError;
  const sheetTitle = sheetMode === 'edit' ? 'Edit idea' : 'New idea';
  const sheetOwnerLabel = sheetMode === 'edit' && editingWish ? getPersonLabel(people, editingWish.owner_id) : addOwnerLabel;

  function setAddSheetOpen(open: boolean) {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (open) {
      nextSearchParams.set('create', 'wishlist');
    } else {
      nextSearchParams.delete('create');
    }

    setSearchParams(nextSearchParams, { replace: true });
  }

  function resetForm() {
    setTitle('');
    setNote('');
    setLink('');
    setOccasion('');
    setPriority('medium');
    setFormOwnerId(selectedOwnerId !== ALL_PEOPLE_FILTER ? selectedOwnerId : currentPersonId ?? people[0]?.id ?? '');
    setEditingWishId(null);
    setSheetMode('create');
  }

  function openAddSheet() {
    setSheetMode('create');
    setEditingWishId(null);
    setTitle('');
    setNote('');
    setLink('');
    setOccasion('');
    setPriority('medium');
    setFormOwnerId(selectedOwnerId !== ALL_PEOPLE_FILTER ? selectedOwnerId : currentPersonId ?? people[0]?.id ?? '');
    setAddSheetOpen(true);
  }

  function openEditSheet(item: WishlistItem) {
    setSheetMode('edit');
    setEditingWishId(item.id);
    setTitle(item.title);
    setNote(item.note);
    setLink(item.link);
    setOccasion(item.occasion);
    setPriority(item.priority || 'medium');
    setFormOwnerId(item.owner_id);
    setSelectedWishId(item.id);
    setAddSheetOpen(true);
  }

  function closeAddSheet() {
    setAddSheetOpen(false);
    resetForm();
  }

  function handleOwnerChange(ownerId: string) {
    setSelectedOwnerId(ownerId);
    setSelectedWishId(null);
  }

  async function handleSaveItem() {
    const cleanTitle = title.trim();

    if (!cleanTitle || !effectiveAddOwnerId) return;

    const input = {
      title: cleanTitle,
      note: note.trim(),
      link: link.trim(),
      occasion: occasion.trim(),
      priority,
      ownerId: effectiveAddOwnerId,
    };

    if (sheetMode === 'edit' && editingWishId) {
      const updatedItem = await editItem(editingWishId, input);

      if (!updatedItem) return;

      setSelectedWishId(updatedItem.id);
      closeAddSheet();

      if (selectedOwnerId !== ALL_PEOPLE_FILTER && updatedItem.owner_id !== selectedOwnerId) {
        setSelectedOwnerId(updatedItem.owner_id);
      }

      return;
    }

    const newItem = await addItem(input);

    if (!newItem) return;

    setSelectedWishId(newItem.id);
    closeAddSheet();

    if (selectedOwnerId === ALL_PEOPLE_FILTER) {
      setSelectedOwnerId(newItem.owner_id);
    }
  }

  function handleDeleteItem(item: WishlistItem) {
    if (selectedWishId === item.id) {
      setSelectedWishId(null);
    }

    if (editingWishId === item.id) {
      closeAddSheet();
    }

    deleteItem(item.id);
  }

  return (
    <main>
      <PageHeader
        eyebrow="Wishlist"
        title="Saved ideas"
        subtitle="Gift ideas, useful links, and shared wants separated by person instead of tossed into one household junk drawer. Progress, allegedly."
        right={<BackButton fallbackTo="/family" label="Family" />}
      />

      <PageShell>
        <GlassCard className="wishlistSummaryCard">
          <div>
            <p className="mutedLabel">Saved ideas</p>
            <h2>{isPageLoading ? '—' : filteredItems.length}</h2>
            <span>
              {selectedOwnerLabel} · {wishesWithLinks} with links · {items.length} household total
            </span>
          </div>

          <button
            type="button"
            className="wishlistSummaryIcon wishlistSummaryAddButton"
            onClick={openAddSheet}
            aria-label="Add wishlist idea"
          >
            +
          </button>
        </GlassCard>

        <GlassCard className="wishlistPeopleCard">
          <div className="wishlistPeopleHeader">
            <div>
              <p>View by person</p>
              <span>Everyone can see everything. This only separates wishes by who they belong to.</span>
            </div>
          </div>

          <div className="wishlistPeopleTabs" role="tablist" aria-label="Wishlist owner filter">
            <button
              type="button"
              className={selectedOwnerId === ALL_PEOPLE_FILTER ? 'wishlistPeopleTabActive' : ''}
              onClick={() => handleOwnerChange(ALL_PEOPLE_FILTER)}
            >
              All
            </button>

            {people.map((person) => (
              <button
                key={person.id}
                type="button"
                className={selectedOwnerId === person.id ? 'wishlistPeopleTabActive' : ''}
                onClick={() => handleOwnerChange(person.id)}
              >
                {person.label}
              </button>
            ))}
          </div>
        </GlassCard>

        {isPageLoading && (
          <GlassCard className="tasksCard">
            <p className="mutedLabel">Loading wishlist...</p>
          </GlassCard>
        )}

        {pageError && (
          <GlassCard className="tasksCard">
            <p className="mutedLabel">{pageError}</p>
          </GlassCard>
        )}

        {!isPageLoading && !pageError && (
          <GlassCard className="wishlistListCard">
            <SectionHeader
              title={`Ideas · ${selectedOwnerLabel}`}
              action={
                <button type="button" onClick={openAddSheet}>
                  Add
                </button>
              }
            />

            <div className="wishlistCleanList">
              {filteredItems.length === 0 ? (
                <div className="wishlistEmptyRow">
                  <div className="wishlistRowIcon">♡</div>
                  <div>
                    <strong>No saved ideas</strong>
                    <span>Add gift ideas, wishes, or useful links for {selectedOwnerLabel.toLowerCase()}.</span>
                  </div>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedWish?.id === item.id;

                  return (
                    <div key={item.id} className={`wishlistCleanRow ${isSelected ? 'wishlistCleanRowSelected' : ''}`}>
                      <div className="wishlistRowIcon">♡</div>

                      <button
                        type="button"
                        className="wishlistRowMain"
                        onClick={() => setSelectedWishId(item.id)}
                        aria-label={`Open ${item.title}`}
                      >
                        <strong>{item.title}</strong>
                        <span>
                          {selectedOwnerId === ALL_PEOPLE_FILTER ? `${getPersonLabel(people, item.owner_id)} · ` : ''}
                          {getWishlistSummary(item)}
                        </span>
                      </button>

                      <button
                        type="button"
                        className="wishlistDeleteButton"
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

        {!isPageLoading && !pageError && selectedWish && (
          <GlassCard className="wishlistDetailCardClean">
            <div className="wishlistDetailHeaderClean">
              <div>
                <p>Selected idea</p>
                <h2>{selectedWish.title}</h2>
                <span>{getWishlistMeta(selectedWish, getPersonLabel(people, selectedWish.owner_id))}</span>
              </div>

              <div className="wishlistDetailIconClean" aria-hidden="true">
                ♡
              </div>
            </div>

            <div className="wishlistDetailMetaGridClean">
              <div>
                <span>Person</span>
                <strong>{getPersonLabel(people, selectedWish.owner_id)}</strong>
              </div>

              <div>
                <span>Priority</span>
                <strong>{getPriorityLabel(selectedWish.priority)}</strong>
              </div>

              <div>
                <span>Created</span>
                <strong>{formatCreatedDate(selectedWish.created_at)}</strong>
              </div>
            </div>

            <div className="wishlistDetailSectionClean">
              <p>Note</p>
              <div className="wishlistDetailTextClean">{getWishlistSummary(selectedWish)}</div>
            </div>

            {selectedWish.link && (
              <a
                className="wishlistDetailLinkClean"
                href={selectedWish.link}
                target="_blank"
                rel="noreferrer"
              >
                Open saved link
              </a>
            )}

            <div className="wishlistDetailActionsClean">
              <button type="button" onClick={() => openEditSheet(selectedWish)}>
                Edit idea
              </button>
            </div>
          </GlassCard>
        )}
      </PageShell>

      {isAddSheetOpen && (
        <div className="wishlistAddSheetOverlay" onClick={closeAddSheet}>
          <section className="wishlistAddSheet" onClick={(event) => event.stopPropagation()}>
            <div className="wishlistAddSheetHandle" />

            <div className="wishlistAddSheetHeader">
              <div>
                <p>{sheetTitle}</p>
                <h2>For {sheetOwnerLabel}</h2>
                <span>{sheetMode === 'edit' ? 'Update this saved idea.' : 'Save a gift idea, useful link, or future want.'}</span>
              </div>

              <button type="button" onClick={closeAddSheet} aria-label="Close wishlist sheet">
                ×
              </button>
            </div>

            <div className="wishlistAddSheetForm">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSaveItem();
                }}
                placeholder="Idea title"
                autoFocus
                aria-label="Wishlist item title"
              />

              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Note"
                aria-label="Wishlist item note"
                rows={3}
              />

              <input
                value={link}
                onChange={(event) => setLink(event.target.value)}
                placeholder="Link"
                aria-label="Wishlist item link"
              />

              <div className="wishlistAddSheetGrid">
                <select value={priority} onChange={(event) => setPriority(event.target.value)} aria-label="Priority">
                  {PRIORITY_OPTIONS.map((priorityOption) => (
                    <option key={priorityOption} value={priorityOption}>
                      {getPriorityLabel(priorityOption)}
                    </option>
                  ))}
                </select>

                <input
                  value={occasion}
                  onChange={(event) => setOccasion(event.target.value)}
                  placeholder="Occasion"
                  aria-label="Occasion"
                />
              </div>

              <select
                value={effectiveAddOwnerId}
                onChange={(event) => setFormOwnerId(event.target.value)}
                aria-label="Wishlist owner"
              >
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.label}
                  </option>
                ))}
              </select>

              <button type="button" onClick={handleSaveItem} disabled={!title.trim() || !effectiveAddOwnerId}>
                {sheetMode === 'edit' ? 'Save changes' : 'Add idea'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
