import { useState } from 'react';
import { useRecipes } from '../hooks/useRecipes';
import BackButton from '../../../ui/navigation/BackButton';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';
import SectionHeader from '../../../ui/layout/SectionHeader';

export default function RecipesPage() {
  const { items, isLoading, errorMessage, addItem, deleteItem } = useRecipes();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Family');

  function handleAddItem() {
    const cleanName = name.trim();

    if (!cleanName) return;

    addItem({
      name: cleanName,
      ingredients: '',
      steps: '',
      category: category.trim() || 'Family',
      serves: '',
    });

    setName('');
    setCategory('Family');
  }

  return (
    <main>
      <PageHeader
        eyebrow="Recipes"
        title="Recipe book"
        subtitle="A calm place for meals that worked, instead of trusting memory like an amateur."
        right={<BackButton fallbackTo="/family" label="Family" />}
      />

      <PageShell>
        <GlassCard className="moduleCreateCard">
          <div className="moduleCreateForm moduleCreateFormThree">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleAddItem();
              }}
              placeholder="Recipe name"
              aria-label="Recipe name"
            />

            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleAddItem();
              }}
              placeholder="Category"
              aria-label="Recipe category"
            />

            <button type="button" onClick={handleAddItem} disabled={!name.trim()}>
              Add
            </button>
          </div>
        </GlassCard>

        {isLoading && (
          <GlassCard className="tasksCard">
            <p className="mutedLabel">Loading recipes...</p>
          </GlassCard>
        )}

        {errorMessage && (
          <GlassCard className="tasksCard">
            <p className="mutedLabel">{errorMessage}</p>
          </GlassCard>
        )}

        {!isLoading && !errorMessage && (
          <GlassCard className="moduleListCard">
            <SectionHeader title="Recipes" />

            <div className="moduleList">
              {items.length === 0 ? (
                <div className="moduleEmptyRow">
                  <div className="moduleIcon tintOrange">🍳</div>
                  <div>
                    <strong>No recipes yet</strong>
                    <span>Tragic. Add food wisdom later.</span>
                  </div>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="moduleRow">
                    <div className="moduleIcon tintOrange">🍳</div>

                    <div className="moduleMainText">
                      <strong>{item.name}</strong>
                      <span>
                        {item.category || 'Recipe'}
                        {item.serves ? ` · Serves ${item.serves}` : ''}
                        {item.is_pinned ? ' · Pinned' : ''}
                      </span>
                    </div>

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
      </PageShell>
    </main>
  );
}
