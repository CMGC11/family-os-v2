import { useState } from 'react';
import { useMedicalNotes } from '../hooks/useMedicalNotes';
import BackButton from '../../../ui/navigation/BackButton';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';
import SectionHeader from '../../../ui/layout/SectionHeader';

export default function HealthPage() {
  const { items, isLoading, errorMessage, addItem, deleteItem } = useMedicalNotes();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');

  function handleAddItem() {
    const cleanTitle = title.trim();

    if (!cleanTitle) return;

    addItem(cleanTitle, content.trim(), date);
    setTitle('');
    setContent('');
    setDate('');
  }

  return (
    <main>
      <PageHeader
        eyebrow="Health"
        title="Care notes"
        subtitle="Appointments, medication, emergency info, and the kind of details nobody remembers when needed."
        right={<BackButton fallbackTo="/family" label="Family" />}
      />

      <PageShell>
        <GlassCard className="moduleCreateCard">
          <div className="moduleCreateForm moduleCreateFormFour">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleAddItem();
              }}
              placeholder="Note title"
              aria-label="Health note title"
            />

            <input
              value={content}
              onChange={(event) => setContent(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleAddItem();
              }}
              placeholder="Details"
              aria-label="Health note details"
            />

            <input
              value={date}
              onChange={(event) => setDate(event.target.value)}
              type="date"
              aria-label="Health note date"
            />

            <button type="button" onClick={handleAddItem} disabled={!title.trim()}>
              Add
            </button>
          </div>
        </GlassCard>

        {isLoading && (
          <GlassCard className="tasksCard">
            <p className="mutedLabel">Loading health notes...</p>
          </GlassCard>
        )}

        {errorMessage && (
          <GlassCard className="tasksCard">
            <p className="mutedLabel">{errorMessage}</p>
          </GlassCard>
        )}

        {!isLoading && !errorMessage && (
          <GlassCard className="moduleListCard">
            <SectionHeader title="Notes" />

            <div className="moduleList">
              {items.length === 0 ? (
                <div className="moduleEmptyRow">
                  <div className="moduleIcon tintGreen">+</div>
                  <div>
                    <strong>No health notes</strong>
                    <span>Good. Or undocumented. Let’s hope good.</span>
                  </div>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="moduleRow">
                    <div className="moduleIcon tintGreen">+</div>

                    <div className="moduleMainText">
                      <strong>{item.title}</strong>
                      <span>
                        {item.date || 'No date'}
                        {item.content ? ` · ${item.content}` : ''}
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
