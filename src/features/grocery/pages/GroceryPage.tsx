import { useState } from 'react';
import { useFamilyStore } from '../../../lib/store/useFamilyStore';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';

export default function GroceryPage() {
  const { grocery, toggleItem, addItem } = useFamilyStore();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Produce');

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
      />

      <PageShell>
        <GlassCard className="tasksCard groceryFormCard">
          <div className="groceryForm">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
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
            {grocery.map((item) => (
              <button
                key={item.id}
                type="button"
                className="hubRow"
                onClick={() => toggleItem(item.id)}
              >
                <div className="hubIcon tintLime">{item.checked ? '✓' : '◌'}</div>

                <div>
                  <strong className={item.checked ? 'taskTextDone' : ''}>{item.name}</strong>
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