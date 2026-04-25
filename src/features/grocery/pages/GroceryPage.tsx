import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGroceryItems } from '../hooks/useGroceryItems';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';
import BackButton from '../../../ui/navigation/BackButton';

export default function GroceryPage() {
  const { items, toggleItem, addItem, deleteItem } = useGroceryItems();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Produce');

  const shouldFocus = searchParams.get('create') === 'grocery';

  function handleAddItem() {
    addItem(name, category);
    setName('');
    setCategory('Produce');
  }

  return (
    <main>
      <PageHeader
        eyebrow="Grocery"
        title="Shopping list"
        subtitle="Grouped shopping execution without turning groceries into a project management ritual."
        right={<BackButton fallbackTo="/family" label="Family" />}
      />

      <PageShell>
        <GlassCard className="tasksCard groceryFormCard">
          <div className="groceryForm">
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
              <option>Produce</option>
              <option>Dairy</option>
              <option>Baby</option>
              <option>Pantry</option>
              <option>Household</option>
              <option>Other</option>
            </select>

            <button type="button" onClick={handleAddItem}>
              Add
            </button>
          </div>
        </GlassCard>

        <GlassCard className="tasksCard">
          <div className="hubList">
            {items.map((item) => (
              <div key={item.id} className="groceryRow">
                <button
                  type="button"
                  className="hubRow groceryMainButton"
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="hubIcon tintLime">{item.checked ? '✓' : '◌'}</div>

                  <div>
                    <strong className={item.checked ? 'taskTextDone' : ''}>{item.name}</strong>
                    <span>{item.category}</span>
                  </div>

                  <span className="chevron">›</span>
                </button>

                <button
                  type="button"
                  className="groceryDeleteButton"
                  onClick={() => deleteItem(item.id)}
                  aria-label={`Delete ${item.name}`}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      </PageShell>
    </main>
  );
}