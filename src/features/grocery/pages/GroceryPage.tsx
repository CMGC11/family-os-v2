import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGroceryItems } from '../hooks/useGroceryItems';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';
import SectionHeader from '../../../ui/layout/SectionHeader';
import BackButton from '../../../ui/navigation/BackButton';

const CATEGORIES = ['Produce', 'Dairy', 'Baby', 'Pantry', 'Household', 'Other'];

export default function GroceryPage() {
  const { items, isLoading, errorMessage, toggleItem, addItem, deleteItem } = useGroceryItems();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Produce');

  const shouldFocus = searchParams.get('create') === 'grocery';
  const openItems = useMemo(() => items.filter((item) => !item.checked), [items]);
  const checkedItems = useMemo(() => items.filter((item) => item.checked), [items]);

  function handleAddItem() {
    const cleanName = name.trim();

    if (!cleanName) return;

    addItem(cleanName, category);
    setName('');
    setCategory('Produce');
  }

  return (
    <main>
      <PageHeader
        eyebrow="Grocery"
        title="Shopping list"
        subtitle="A shared list for getting in, buying the thing, and escaping the supermarket with dignity."
        right={<BackButton fallbackTo="/family" label="Family" />}
      />

      <PageShell>
        <GlassCard className="moduleCreateCard">
          <div className="moduleCreateForm moduleCreateFormThree">
            <input
              autoFocus={shouldFocus}
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleAddItem();
              }}
              placeholder="Add item"
              aria-label="Grocery item name"
            />

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Grocery category"
            >
              {CATEGORIES.map((categoryOption) => (
                <option key={categoryOption}>{categoryOption}</option>
              ))}
            </select>

            <button type="button" onClick={handleAddItem} disabled={!name.trim()}>
              Add
            </button>
          </div>
        </GlassCard>

        {isLoading && (
          <GlassCard className="tasksCard">
            <p className="mutedLabel">Loading groceries...</p>
          </GlassCard>
        )}

        {errorMessage && (
          <GlassCard className="tasksCard">
            <p className="mutedLabel">{errorMessage}</p>
          </GlassCard>
        )}

        {!isLoading && !errorMessage && (
          <GlassCard className="moduleListCard">
            <SectionHeader title="To buy" />

            <div className="moduleList">
              {openItems.length === 0 ? (
                <div className="moduleEmptyRow">
                  <div className="moduleIcon tintBlue">✓</div>
                  <div>
                    <strong>Nothing to buy</strong>
                    <span>The list is clean. Suspicious, but beautiful.</span>
                  </div>
                </div>
              ) : (
                openItems.map((item) => (
                  <div key={item.id} className="moduleRow">
                    <button
                      type="button"
                      className="moduleCheck"
                      onClick={() => toggleItem(item.id)}
                      aria-label={`Mark ${item.name} as bought`}
                    />

                    <button type="button" className="moduleMainButton" onClick={() => toggleItem(item.id)}>
                      <strong>{item.name}</strong>
                      <span>{item.category}</span>
                    </button>

                    <button
                      type="button"
                      className="moduleDeleteButton"
                      onClick={() => deleteItem(item.id)}
                      aria-label={`Delete ${item.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        )}

        {!isLoading && !errorMessage && checkedItems.length > 0 && (
          <GlassCard className="moduleListCard moduleDoneCard">
            <SectionHeader title="Bought" />

            <div className="moduleList">
              {checkedItems.map((item) => (
                <div key={item.id} className="moduleRow moduleRowDone">
                  <button
                    type="button"
                    className="moduleCheck moduleCheckDone"
                    onClick={() => toggleItem(item.id)}
                    aria-label={`Mark ${item.name} as not bought`}
                  >
                    ✓
                  </button>

                  <button type="button" className="moduleMainButton" onClick={() => toggleItem(item.id)}>
                    <strong>{item.name}</strong>
                    <span>{item.category}</span>
                  </button>

                  <button
                    type="button"
                    className="moduleDeleteButton"
                    onClick={() => deleteItem(item.id)}
                    aria-label={`Delete ${item.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </PageShell>
    </main>
  );
}
