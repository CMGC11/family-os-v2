import { useMemo, useState } from 'react';
import { useHealthItems } from '../hooks/useHealthItems';
import { useMedicalNotes } from '../hooks/useMedicalNotes';
import type { Allergy, MedicalNote, Medication } from '../types';
import BackButton from '../../../ui/navigation/BackButton';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';
import SectionHeader from '../../../ui/layout/SectionHeader';

const ALLERGY_SEVERITIES = ['mild', 'moderate', 'severe'];

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

function getAllergySummary(allergy: Allergy) {
  if (allergy.notes.trim()) return allergy.notes.trim();
  return `${allergy.severity} severity`;
}

function getMedicationSummary(medication: Medication) {
  const parts = [medication.dosage, medication.frequency].filter(Boolean);

  if (parts.length > 0) return parts.join(' · ');
  if (medication.notes.trim()) return medication.notes.trim();
  return 'No dosage or frequency added.';
}

export default function HealthPage() {
  const { items, isLoading, errorMessage, addItem, deleteItem } = useMedicalNotes();
  const {
    allergies,
    medications,
    isLoading: isLoadingHealthItems,
    errorMessage: healthItemsError,
    addAllergy,
    removeAllergy,
    addMedication,
    removeMedication,
  } = useHealthItems();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const [allergyName, setAllergyName] = useState('');
  const [allergySeverity, setAllergySeverity] = useState('moderate');
  const [allergyNotes, setAllergyNotes] = useState('');

  const [medicationName, setMedicationName] = useState('');
  const [medicationDosage, setMedicationDosage] = useState('');
  const [medicationFrequency, setMedicationFrequency] = useState('');
  const [medicationNotes, setMedicationNotes] = useState('');

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

  function handleAddAllergy() {
    const cleanName = allergyName.trim();

    if (!cleanName) return;

    addAllergy(cleanName, allergySeverity, allergyNotes);
    setAllergyName('');
    setAllergySeverity('moderate');
    setAllergyNotes('');
  }

  function handleAddMedication() {
    const cleanName = medicationName.trim();

    if (!cleanName) return;

    addMedication(cleanName, medicationDosage, medicationFrequency, medicationNotes);
    setMedicationName('');
    setMedicationDosage('');
    setMedicationFrequency('');
    setMedicationNotes('');
  }

  const isPageLoading = isLoading || isLoadingHealthItems;
  const pageError = errorMessage || healthItemsError;

  return (
    <main>
      <PageHeader
        eyebrow="Health"
        title="Care notes"
        subtitle="Notes, allergies, and medications in one place, because memory is not a medical system. Annoying, but true."
        right={<BackButton fallbackTo="/family" label="Family" />}
      />

      <PageShell>
        <GlassCard className="healthSummaryCard">
          <div>
            <p className="mutedLabel">Health profile</p>
            <h2>{isPageLoading ? '—' : items.length + allergies.length + medications.length}</h2>
            <span>
              {items.length} notes · {allergies.length} allergies · {medications.length} medications
            </span>
          </div>

          <div className="healthSummaryIcon" aria-hidden="true">
            +
          </div>
        </GlassCard>

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

        {isPageLoading && (
          <GlassCard className="tasksCard">
            <p className="mutedLabel">Loading health information...</p>
          </GlassCard>
        )}

        {pageError && (
          <GlassCard className="tasksCard">
            <p className="mutedLabel">{pageError}</p>
          </GlassCard>
        )}

        {!isPageLoading && !pageError && (
          <>
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

            {selectedNote && (
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
              </GlassCard>
            )}

            <GlassCard className="healthSubsectionCard">
              <div className="healthSubsectionHeader">
                <div>
                  <p>Allergies</p>
                  <h2>{allergies.length} saved</h2>
                </div>
              </div>

              <div className="healthInlineForm healthInlineFormAllergy">
                <input
                  value={allergyName}
                  onChange={(event) => setAllergyName(event.target.value)}
                  placeholder="Allergy"
                  aria-label="Allergy name"
                />

                <select
                  value={allergySeverity}
                  onChange={(event) => setAllergySeverity(event.target.value)}
                  aria-label="Allergy severity"
                >
                  {ALLERGY_SEVERITIES.map((severity) => (
                    <option key={severity} value={severity}>
                      {severity}
                    </option>
                  ))}
                </select>

                <input
                  value={allergyNotes}
                  onChange={(event) => setAllergyNotes(event.target.value)}
                  placeholder="Notes"
                  aria-label="Allergy notes"
                />

                <button type="button" onClick={handleAddAllergy} disabled={!allergyName.trim()}>
                  Add
                </button>
              </div>

              <div className="healthCompactList">
                {allergies.length === 0 ? (
                  <div className="healthCompactEmptyRow">
                    <div className="healthCompactIcon tintGreen">!</div>
                    <div>
                      <strong>No allergies saved</strong>
                      <span>Add the important ones before everyone forgets. Again.</span>
                    </div>
                  </div>
                ) : (
                  allergies.map((allergy) => (
                    <div key={allergy.id} className="healthCompactRow">
                      <div className="healthCompactIcon tintOrange">!</div>

                      <div className="healthCompactText">
                        <strong>{allergy.name}</strong>
                        <span>{getAllergySummary(allergy)}</span>
                      </div>

                      <span className={`healthSeverityPill healthSeverity${allergy.severity}`}>{allergy.severity}</span>

                      <button
                        type="button"
                        className="healthDeleteButton"
                        onClick={() => removeAllergy(allergy.id)}
                        aria-label={`Delete ${allergy.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>

            <GlassCard className="healthSubsectionCard">
              <div className="healthSubsectionHeader">
                <div>
                  <p>Medications</p>
                  <h2>{medications.length} saved</h2>
                </div>
              </div>

              <div className="healthInlineForm healthInlineFormMedication">
                <input
                  value={medicationName}
                  onChange={(event) => setMedicationName(event.target.value)}
                  placeholder="Medication"
                  aria-label="Medication name"
                />

                <input
                  value={medicationDosage}
                  onChange={(event) => setMedicationDosage(event.target.value)}
                  placeholder="Dosage"
                  aria-label="Medication dosage"
                />

                <input
                  value={medicationFrequency}
                  onChange={(event) => setMedicationFrequency(event.target.value)}
                  placeholder="Frequency"
                  aria-label="Medication frequency"
                />

                <input
                  value={medicationNotes}
                  onChange={(event) => setMedicationNotes(event.target.value)}
                  placeholder="Notes"
                  aria-label="Medication notes"
                />

                <button type="button" onClick={handleAddMedication} disabled={!medicationName.trim()}>
                  Add
                </button>
              </div>

              <div className="healthCompactList">
                {medications.length === 0 ? (
                  <div className="healthCompactEmptyRow">
                    <div className="healthCompactIcon tintBlue">Rx</div>
                    <div>
                      <strong>No medications saved</strong>
                      <span>Add name, dosage, and frequency when needed.</span>
                    </div>
                  </div>
                ) : (
                  medications.map((medication) => (
                    <div key={medication.id} className="healthCompactRow healthMedicationRow">
                      <div className="healthCompactIcon tintBlue">Rx</div>

                      <div className="healthCompactText">
                        <strong>{medication.name}</strong>
                        <span>{getMedicationSummary(medication)}</span>
                      </div>

                      <button
                        type="button"
                        className="healthDeleteButton"
                        onClick={() => removeMedication(medication.id)}
                        aria-label={`Delete ${medication.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </>
        )}
      </PageShell>
    </main>
  );
}
