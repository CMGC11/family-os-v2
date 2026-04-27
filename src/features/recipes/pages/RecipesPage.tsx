import { useMemo, useState } from 'react';
import { useRecipes } from '../hooks/useRecipes';
import type { Recipe } from '../types';
import BackButton from '../../../ui/navigation/BackButton';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';
import SectionHeader from '../../../ui/layout/SectionHeader';

function splitRecipeText(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatRecipeMeta(recipe: Recipe) {
  const parts = [recipe.category || 'Recipe'];

  if (recipe.serves) {
    parts.push(`Serves ${recipe.serves}`);
  }

  if (recipe.is_pinned) {
    parts.push('Pinned');
  }

  return parts.join(' · ');
}

export default function RecipesPage() {
  const { items, isLoading, errorMessage, addItem, deleteItem } = useRecipes();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Family');
  const [serves, setServes] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const selectedRecipe = useMemo(
    () => items.find((item) => item.id === selectedRecipeId) ?? null,
    [items, selectedRecipeId],
  );

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
        return a.name.localeCompare(b.name);
      }),
    [items],
  );

  function resetForm() {
    setName('');
    setCategory('Family');
    setServes('');
    setIngredients('');
    setSteps('');
  }

  function handleAddItem() {
    const cleanName = name.trim();

    if (!cleanName) return;

    addItem({
      name: cleanName,
      ingredients,
      steps,
      category: category.trim() || 'Family',
      serves,
    });

    resetForm();
  }

  async function handleDeleteRecipe(recipe: Recipe) {
    if (selectedRecipeId === recipe.id) {
      setSelectedRecipeId(null);
    }

    await deleteItem(recipe.id);
  }

  return (
    <main>
      <PageHeader
        eyebrow="Recipes"
        title="Recipe book"
        subtitle="Saved meals, useful instructions, and fewer desperate guesses near the stove. A daring leap for civilization."
        right={<BackButton fallbackTo="/family" label="Family" />}
      />

      <PageShell>
        <GlassCard className="recipeCreateCard">
          <div className="recipeCreateHeader">
            <div>
              <p className="mutedLabel">New recipe</p>
              <h2>Add a keeper</h2>
            </div>
          </div>

          <div className="recipeCreateGrid">
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
              placeholder="Ingredients, one per line"
              aria-label="Recipe ingredients"
            />

            <textarea
              value={steps}
              onChange={(event) => setSteps(event.target.value)}
              placeholder="Steps, one per line"
              aria-label="Recipe steps"
            />

            <button type="button" onClick={handleAddItem} disabled={!name.trim()}>
              Add recipe
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

        {!isLoading && !errorMessage && selectedRecipe && (
          <GlassCard className="recipeDetailCard">
            <div className="recipeDetailTop">
              <div>
                <p>{formatRecipeMeta(selectedRecipe)}</p>
                <h2>{selectedRecipe.name}</h2>
              </div>

              <button type="button" onClick={() => setSelectedRecipeId(null)} aria-label="Close recipe detail">
                ×
              </button>
            </div>

            <div className="recipeDetailContent">
              <section>
                <h3>Ingredients</h3>

                {splitRecipeText(selectedRecipe.ingredients).length > 0 ? (
                  <ul>
                    {splitRecipeText(selectedRecipe.ingredients).map((ingredient) => (
                      <li key={ingredient}>{ingredient}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No ingredients saved yet.</p>
                )}
              </section>

              <section>
                <h3>Steps</h3>

                {splitRecipeText(selectedRecipe.steps).length > 0 ? (
                  <ol>
                    {splitRecipeText(selectedRecipe.steps).map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                ) : (
                  <p>No steps saved yet.</p>
                )}
              </section>

              {(selectedRecipe.notes || selectedRecipe.source_url || selectedRecipe.tags.length > 0) && (
                <section>
                  <h3>Notes</h3>

                  {selectedRecipe.notes && <p>{selectedRecipe.notes}</p>}

                  {selectedRecipe.tags.length > 0 && (
                    <div className="recipeTags">
                      {selectedRecipe.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  )}

                  {selectedRecipe.source_url && (
                    <a href={selectedRecipe.source_url} target="_blank" rel="noreferrer">
                      Open source
                    </a>
                  )}
                </section>
              )}
            </div>
          </GlassCard>
        )}

        {!isLoading && !errorMessage && (
          <GlassCard className="moduleListCard">
            <SectionHeader title="Recipes" />

            <div className="moduleList">
              {sortedItems.length === 0 ? (
                <div className="moduleEmptyRow">
                  <div className="moduleIcon tintOrange">🍳</div>
                  <div>
                    <strong>No recipes yet</strong>
                    <span>Add the meals worth repeating.</span>
                  </div>
                </div>
              ) : (
                sortedItems.map((item) => {
                  const isSelected = selectedRecipeId === item.id;

                  return (
                    <div key={item.id} className={['moduleRow', isSelected ? 'recipeRowSelected' : ''].filter(Boolean).join(' ')}>
                      <div className="moduleIcon tintOrange">🍳</div>

                      <button type="button" className="moduleMainButton" onClick={() => setSelectedRecipeId(item.id)}>
                        <strong>{item.name}</strong>
                        <span>{formatRecipeMeta(item)}</span>
                      </button>

                      <button
                        type="button"
                        className="moduleDeleteButton"
                        onClick={() => handleDeleteRecipe(item)}
                        aria-label={`Delete ${item.name}`}
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
      </PageShell>
    </main>
  );
}
