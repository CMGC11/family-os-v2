import { useMemo, useState } from 'react';
import { useMedicalNotes } from '../hooks/useMedicalNotes';
import type { MedicalNote } from '../types';
import BackButton from '../../../ui/navigation/BackButton';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';
import SectionHeader from '../../../ui/layout/SectionHeader';

function formatHealthDate(dateString: string) {
  if (!dateString) return 'No date';

  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

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

function getHealthSummary(note: MedicalNote) {
  if (note.content.trim()) return note.content.trim();
  return 'No details added yet.';
}

export default function HealthPage() {
  const { items, isLoading, errorMessage, addItem, deleteItem } = useMedicalNotes();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const selectedNote = useMemo(() => {
    if (items.length === 0) return null;

    return items.find((item) => item.id === selectedNoteId) ?? items[0];
  }, [items, selectedNoteId]);

  function handleAddItem() {
    const cleanTitle = title.trim();

    if (!cleanTitle) return;

    addItem(cleanTitle, content.trim(), date);
    setTitle('');
    setContent('');
    setDate('');
  }

  function handleDeleteItem(item: MedicalNote) {
    if (selectedNoteId === item.id) {
      setSelectedNoteId(null);
    }

    deleteItem(item.id);
  }

  return (
    <main>
      <PageHeader
        eyebrow="Health"
        title="Care notes"
        subtitle="Appointments, medication, emergency info, and the kind of details nobody remembers when needed. Very human, very preventable."
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
                items.map((item) => {
                  const isSelected = selectedNote?.id === item.id;

                  return (
                    <div key={item.id} className={`moduleRow ${isSelected ? 'moduleRowSelected' : ''}`}>
                      <div className="moduleIcon tintGreen">+</div>

                      <button
                        type="button"
                        className="moduleMainButton"
                        onClick={() => setSelectedNoteId(item.id)}
                        aria-label={`Open ${item.title}`}
                      >
                        <strong>{item.title}</strong>
                        <span>
                          {formatHealthDate(item.date)}
                          {item.content ? ` · ${item.content}` : ''}
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

        {!isLoading && !errorMessage && selectedNote && (
          <GlassCard className="healthDetailCard">
            <div className="healthDetailHeader">
              <div>
                <p>Selected note</p>
                <h2>{selectedNote.title}</h2>
                <span>{formatHealthDate(selectedNote.date)}</span>
              </div>

              <div className="healthDetailIcon" aria-hidden="true">
                +
              </div>
            </div>

            <div className="healthDetailMetaGrid">
              <div>
                <span>Date</span>
                <strong>{formatHealthDate(selectedNote.date)}</strong>
              </div>

              <div>
                <span>Created</span>
                <strong>{formatCreatedDate(selectedNote.created_at)}</strong>
              </div>
            </div>

            <div className="healthDetailSection">
              <p>Details</p>
              <div className="healthDetailText">{getHealthSummary(selectedNote)}</div>
            </div>

            <div className="healthDetailNotice">
              <strong>Medical basics only</strong>
              <span>Allergies, medications, and sharing are still separate future wiring. One tunnel at a time.</span>
            </div>
          </GlassCard>
        )}
      </PageShell>
    </main>
  );
}
