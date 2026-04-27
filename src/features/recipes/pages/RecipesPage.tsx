import { useState } from 'react';
import { useRecipes } from '../hooks/useRecipes';
import BackButton from '../../../ui/navigation/BackButton';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';

export default function RecipesPage() {
  const { items, isLoading, errorMessage, addItem } = useRecipes();
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [category, setCategory] = useState('Family');
  const [serves, setServes] = useState('');

  function handleAddItem() {
    addItem({
      name,
      ingredients,
      steps,
      category,
      serves,
    });

    setName('');
    setIngredients('');
    setSteps('');
    setCategory('Family');
    setServes('');
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
        <GlassCard className="quickCreateCard">
          <div className="recipeCreateForm">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Recipe name"
              aria-label="Recipe name"
            />

            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Category"
              aria-label="Recipe category"
            />

            <input
              value={serves}
              onChange={(event) => setServes(event.target.value)}
              inputMode="numeric"
              placeholder="Serves"
              aria-label="Recipe serves"
            />

            <textarea
              value={ingredients}
              onChange={(event) => setIngredients(event.target.value)}
              placeholder="Ingredients"
              aria-label="Recipe ingredients"
            />

            <textarea
              value={steps}
              onChange={(event) => setSteps(event.target.value)}
              placeholder="Steps"
              aria-label="Recipe steps"
            />

            <button type="button" onClick={handleAddItem}>
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
          <GlassCard className="tasksCard">
            <div className="hubList">
              {items.length === 0 ? (
                <div className="hubRow">
                  <div className="hubIcon tintOrange">🍳</div>
                  <div>
                    <strong>No recipes yet</strong>
                    <span>Tragic. Add food wisdom later.</span>
                  </div>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="hubRow">
                    <div className="hubIcon tintOrange">🍳</div>

                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        {item.category}
                        {item.serves ? ` · Serves ${item.serves}` : ''}
                        {item.is_pinned ? ' · Pinned' : ''}
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