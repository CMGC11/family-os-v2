import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useHealthItems } from '../hooks/useHealthItems';
import { useMedicalNotes } from '../hooks/useMedicalNotes';
import type { Allergy, MedicalNote, Medication } from '../types';
import { fetchHouseholdPeople, getCurrentPersonId, type HouseholdPerson } from '../../../lib/supabase/person';
import BackButton from '../../../ui/navigation/BackButton';
import GlassCard from '../../../ui/cards/GlassCard';
import PageHeader from '../../../ui/layout/PageHeader';
import PageShell from '../../../ui/layout/PageShell';
import SectionHeader from '../../../ui/layout/SectionHeader';

const ALLERGY_SEVERITIES = ['mild', 'moderate', 'severe'];
const ALL_PEOPLE_FILTER = 'all';

type HealthSection = 'notes' | 'allergies' | 'medications';

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

function sectionLabel(section: HealthSection) {
  if (section === 'notes') return 'Notes';
  if (section === 'allergies') return 'Allergies';
  return 'Meds';
}

function getPersonLabel(people: HouseholdPerson[], personId: string) {
  return people.find((person) => person.id === personId)?.label ?? 'Unknown person';
}

export default function HealthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, isLoading, errorMessage, addItem, editItem, deleteItem } = useMedicalNotes();
  const {
    allergies,
    medications,
    isLoading: isLoadingHealthItems,
    errorMessage: healthItemsError,
    addAllergy,
    editAllergy,
    removeAllergy,
    addMedication,
    removeMedication,
  } = useHealthItems();

  const [people, setPeople] = useState<HouseholdPerson[]>([]);
  const [currentPersonId, setCurrentPersonId] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string>(ALL_PEOPLE_FILTER);
  const [peopleError, setPeopleError] = useState('');
  const [isLoadingPeople, setIsLoadingPeople] = useState(true);

  const [activeSection, setActiveSection] = useState<HealthSection>('notes');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const [allergyName, setAllergyName] = useState('');
  const [allergySeverity, setAllergySeverity] = useState('moderate');
  const [allergyNotes, setAllergyNotes] = useState('');
  const [editingAllergyId, setEditingAllergyId] = useState<string | null>(null);

  const [medicationName, setMedicationName] = useState('');
  const [medicationDosage, setMedicationDosage] = useState('');
  const [medicationFrequency, setMedicationFrequency] = useState('');
  const [medicationNotes, setMedicationNotes] = useState('');

  const isHealthCreateOpen = searchParams.get('create') === 'health';

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
          setSelectedPersonId(nextCurrentPersonId);
        }
      } catch (error) {
        console.error('Failed to load household people for health:', error);

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

  const effectiveAddPersonId = useMemo(() => {
    if (selectedPersonId !== ALL_PEOPLE_FILTER) return selectedPersonId;
    return currentPersonId ?? people[0]?.id ?? '';
  }, [currentPersonId, people, selectedPersonId]);

  const filteredItems = useMemo(() => {
    if (selectedPersonId === ALL_PEOPLE_FILTER) return items;
    return items.filter((item) => item.person_id === selectedPersonId);
  }, [items, selectedPersonId]);

  const filteredAllergies = useMemo(() => {
    if (selectedPersonId === ALL_PEOPLE_FILTER) return allergies;
    return allergies.filter((allergy) => allergy.person_id === selectedPersonId);
  }, [allergies, selectedPersonId]);

  const filteredMedications = useMemo(() => {
    if (selectedPersonId === ALL_PEOPLE_FILTER) return medications;
    return medications.filter((medication) => medication.person_id === selectedPersonId);
  }, [medications, selectedPersonId]);

  const selectedPersonLabel =
    selectedPersonId === ALL_PEOPLE_FILTER ? 'Everyone' : getPersonLabel(people, selectedPersonId);

  const selectedNote = useMemo(() => {
    if (filteredItems.length === 0) return null;

    return filteredItems.find((item) => item.id === selectedNoteId) ?? filteredItems[0];
  }, [filteredItems, selectedNoteId]);

  const severeAllergies = useMemo(
    () => filteredAllergies.filter((allergy) => allergy.severity.toLowerCase() === 'severe'),
    [filteredAllergies],
  );

  const isPageLoading = isLoading || isLoadingHealthItems || isLoadingPeople;
  const pageError = errorMessage || healthItemsError || peopleError;
  const totalItems = filteredItems.length + filteredAllergies.length + filteredMedications.length;

  function handlePersonChange(personId: string) {
    setSelectedPersonId(personId);
    setSelectedNoteId(null);
    resetNoteForm();
    resetAllergyForm();
  }

  function setHealthCreateOpen(open: boolean) {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (open) {
      nextSearchParams.set('create', 'health');
    } else {
      nextSearchParams.delete('create');
    }

    setSearchParams(nextSearchParams, { replace: true });
  }

  function openHealthCreateSheet() {
    setHealthCreateOpen(true);
  }

  function closeHealthCreateSheet() {
    setHealthCreateOpen(false);
  }

  function chooseHealthCreateSection(section: HealthSection) {
    setActiveSection(section);
    setHealthCreateOpen(false);
  }

  function resetNoteForm() {
    setTitle('');
    setContent('');
    setDate('');
    setEditingNoteId(null);
  }

  function resetAllergyForm() {
    setAllergyName('');
    setAllergySeverity('moderate');
    setAllergyNotes('');
    setEditingAllergyId(null);
  }

  async function handleSaveItem() {
    const cleanTitle = title.trim();

    if (!cleanTitle) return;

    if (editingNoteId) {
      const updatedItem = await editItem(editingNoteId, cleanTitle, content.trim(), date);

      if (updatedItem) {
        setSelectedNoteId(updatedItem.id);
        resetNoteForm();
        setActiveSection('notes');
      }

      return;
    }

    if (!effectiveAddPersonId) return;

    const newItem = await addItem(cleanTitle, content.trim(), date, effectiveAddPersonId);

    if (newItem) {
      setSelectedNoteId(newItem.id);
      resetNoteForm();
      setActiveSection('notes');

      if (selectedPersonId === ALL_PEOPLE_FILTER) {
        setSelectedPersonId(effectiveAddPersonId);
      }
    }
  }

  function handleStartEditItem(item: MedicalNote) {
    setActiveSection('notes');
    setSelectedNoteId(item.id);
    setEditingNoteId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setDate(item.date);
  }

  function handleCancelEditItem() {
    resetNoteForm();
  }

  function handleDeleteItem(item: MedicalNote) {
    if (selectedNoteId === item.id) {
      setSelectedNoteId(null);
    }

    if (editingNoteId === item.id) {
      resetNoteForm();
    }

    deleteItem(item.id);
  }

  async function handleSaveAllergy() {
    const cleanName = allergyName.trim();

    if (!cleanName) return;

    if (editingAllergyId) {
      const updatedAllergy = await editAllergy(editingAllergyId, cleanName, allergySeverity, allergyNotes);

      if (updatedAllergy) {
        resetAllergyForm();
        setActiveSection('allergies');
      }

      return;
    }

    if (!effectiveAddPersonId) return;

    const newAllergy = await addAllergy(cleanName, allergySeverity, allergyNotes, effectiveAddPersonId);

    if (newAllergy) {
      resetAllergyForm();
      setActiveSection('allergies');

      if (selectedPersonId === ALL_PEOPLE_FILTER) {
        setSelectedPersonId(effectiveAddPersonId);
      }
    }
  }

  function handleStartEditAllergy(allergy: Allergy) {
    setActiveSection('allergies');
    setEditingAllergyId(allergy.id);
    setAllergyName(allergy.name);
    setAllergySeverity(allergy.severity || 'moderate');
    setAllergyNotes(allergy.notes);
  }

  function handleCancelEditAllergy() {
    resetAllergyForm();
  }

  function handleDeleteAllergy(allergy: Allergy) {
    if (editingAllergyId === allergy.id) {
      resetAllergyForm();
    }

    removeAllergy(allergy.id);
  }

  function handleAddMedication() {
    const cleanName = medicationName.trim();

    if (!cleanName || !effectiveAddPersonId) return;

    addMedication(cleanName, medicationDosage, medicationFrequency, medicationNotes, effectiveAddPersonId);
    setMedicationName('');
    setMedicationDosage('');
    setMedicationFrequency('');
    setMedicationNotes('');
    setActiveSection('medications');

    if (selectedPersonId === ALL_PEOPLE_FILTER) {
      setSelectedPersonId(effectiveAddPersonId);
    }
  }

  return (
    <main>
      <PageHeader
        eyebrow="Health"
        title="Care notes"
        subtitle="Household-visible health information, separated by person so it stops becoming one big medical soup."
        right={<BackButton fallbackTo="/family" label="Family" />}
      />

      <PageShell>
        <GlassCard className="healthSummaryCard healthCleanSummaryCard">
          <div>
            <p className="mutedLabel">Health profile</p>
            <h2>{isPageLoading ? '—' : totalItems}</h2>
            <span>
              {selectedPersonLabel} · {filteredItems.length} notes · {filteredAllergies.length} allergies ·{' '}
              {filteredMedications.length} meds
            </span>
          </div>

          <button
            type="button"
            className="healthSummaryIcon healthSummaryAddButton"
            onClick={openHealthCreateSheet}
            aria-label="Add health record"
          >
            +
          </button>
        </GlassCard>

        <GlassCard className="healthPeopleCard">
          <div className="healthPeopleHeader">
            <div>
              <p>View by person</p>
              <span>Everyone can see everything. This only separates records by who they belong to.</span>
            </div>
          </div>

          <div className="healthPeopleTabs" role="tablist" aria-label="Health people filter">
            <button
              type="button"
              className={selectedPersonId === ALL_PEOPLE_FILTER ? 'healthPeopleTabActive' : ''}
              onClick={() => handlePersonChange(ALL_PEOPLE_FILTER)}
            >
              All
            </button>

            {people.map((person) => (
              <button
                key={person.id}
                type="button"
                className={selectedPersonId === person.id ? 'healthPeopleTabActive' : ''}
                onClick={() => handlePersonChange(person.id)}
              >
                {person.label}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="healthSectionTabsCard">
          <div className="healthSectionTabs" role="tablist" aria-label="Health sections">
            {(['notes', 'allergies', 'medications'] as HealthSection[]).map((section) => (
              <button
                key={section}
                type="button"
                className={activeSection === section ? 'healthSectionTabActive' : ''}
                onClick={() => setActiveSection(section)}
              >
                <span>{sectionLabel(section)}</span>
                <strong>
                  {section === 'notes'
                    ? filteredItems.length
                    : section === 'allergies'
                      ? filteredAllergies.length
                      : filteredMedications.length}
                </strong>
              </button>
            ))}
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

        {!isPageLoading && !pageError && severeAllergies.length > 0 && (
          <GlassCard className="healthNoticeCard">
            <div className="healthNoticeIcon" aria-hidden="true">
              !
            </div>
            <div>
              <strong>{severeAllergies.length} severe allergy alert{severeAllergies.length === 1 ? '' : 's'}</strong>
              <span>{severeAllergies.map((allergy) => allergy.name).join(', ')}</span>
            </div>
          </GlassCard>
        )}

        {!isPageLoading && !pageError && activeSection === 'notes' && (
          <>
            <GlassCard className="healthPanelCard">
              <SectionHeader
                title={
                  editingNoteId
                    ? 'Edit medical note'
                    : `Add note for ${
                        selectedPersonId === ALL_PEOPLE_FILTER ? getPersonLabel(people, effectiveAddPersonId) : selectedPersonLabel
                      }`
                }
              />

              {editingNoteId && (
                <p className="healthInlineEditHint">Editing keeps this note attached to {getPersonLabel(people, selectedNote?.person_id ?? '')}.</p>
              )}

              <div className={`healthCleanForm healthCleanFormNote ${editingNoteId ? 'healthCleanFormNoteEditing' : ''}`}>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSaveItem();
                  }}
                  placeholder="Note title"
                  aria-label="Health note title"
                />

                <input
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSaveItem();
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

                <button type="button" onClick={handleSaveItem} disabled={!title.trim() || (!editingNoteId && !effectiveAddPersonId)}>
                  {editingNoteId ? 'Save' : 'Add'}
                </button>

                {editingNoteId && (
                  <button type="button" className="healthSecondaryFormButton" onClick={handleCancelEditItem}>
                    Cancel
                  </button>
                )}
              </div>
            </GlassCard>

            <GlassCard className="healthPanelCard">
              <SectionHeader title="Notes" />

              <div className="moduleList">
                {filteredItems.length === 0 ? (
                  <div className="moduleEmptyRow">
                    <div className="moduleIcon tintGreen">+</div>
                    <div>
                      <strong>No health notes</strong>
                      <span>Nothing saved for {selectedPersonLabel.toLowerCase()} yet.</span>
                    </div>
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const isSelected = selectedNote?.id === item.id;

                    return (
                      <div key={item.id} className={`moduleRow healthNoteRow ${isSelected ? 'moduleRowSelected' : ''}`}>
                        <div className="moduleIcon tintGreen">+</div>

                        <button
                          type="button"
                          className="moduleMainButton"
                          onClick={() => setSelectedNoteId(item.id)}
                          aria-label={`Open ${item.title}`}
                        >
                          <strong>{item.title}</strong>
                          <span>
                            {selectedPersonId === ALL_PEOPLE_FILTER ? `${getPersonLabel(people, item.person_id)} · ` : ''}
                            {formatHealthDate(item.date)}
                            {item.content ? ` · ${item.content}` : ''}
                          </span>
                        </button>

                        <div className="healthRowActions">
                          <button
                            type="button"
                            className="healthRowEditButton"
                            onClick={() => handleStartEditItem(item)}
                            aria-label={`Edit ${item.title}`}
                          >
                            Edit
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
                      </div>
                    );
                  })
                )}
              </div>
            </GlassCard>

            {selectedNote && (
              <GlassCard className="healthDetailCard healthCleanDetailCard">
                <div className="healthDetailHeader">
                  <div>
                    <p>Selected note</p>
                    <h2>{selectedNote.title}</h2>
                    <span>
                      {getPersonLabel(people, selectedNote.person_id)} · {formatHealthDate(selectedNote.date)}
                    </span>
                  </div>

                  <div className="healthDetailActions">
                    <button type="button" onClick={() => handleStartEditItem(selectedNote)}>
                      Edit
                    </button>

                    <button
                      type="button"
                      className="healthDetailAddButton"
                      onClick={openHealthCreateSheet}
                      aria-label="Add health record"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="healthDetailMetaGrid">
                  <div>
                    <span>Person</span>
                    <strong>{getPersonLabel(people, selectedNote.person_id)}</strong>
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
          </>
        )}

        {!isPageLoading && !pageError && activeSection === 'allergies' && (
          <GlassCard className="healthPanelCard">
            <SectionHeader
              title={
                editingAllergyId
                  ? 'Edit allergy'
                  : `Allergies · ${selectedPersonLabel}`
              }
            />

            {editingAllergyId && (
              <p className="healthInlineEditHint">
                Editing keeps this allergy attached to{' '}
                {getPersonLabel(people, allergies.find((allergy) => allergy.id === editingAllergyId)?.person_id ?? '')}.
              </p>
            )}

            <div className={`healthCleanForm healthCleanFormAllergy ${editingAllergyId ? 'healthCleanFormAllergyEditing' : ''}`}>
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

              <button type="button" onClick={handleSaveAllergy} disabled={!allergyName.trim() || (!editingAllergyId && !effectiveAddPersonId)}>
                {editingAllergyId ? 'Save' : 'Add'}
              </button>

              {editingAllergyId && (
                <button type="button" className="healthSecondaryFormButton" onClick={handleCancelEditAllergy}>
                  Cancel
                </button>
              )}
            </div>

            <div className="healthCompactList healthCleanList">
              {filteredAllergies.length === 0 ? (
                <div className="healthCompactEmptyRow">
                  <div className="healthCompactIcon tintGreen">!</div>
                  <div>
                    <strong>No allergies saved</strong>
                    <span>Nothing saved for {selectedPersonLabel.toLowerCase()} yet.</span>
                  </div>
                </div>
              ) : (
                filteredAllergies.map((allergy) => (
                  <div key={allergy.id} className="healthCompactRow healthCleanRow healthAllergyRow">
                    <div className="healthCompactIcon tintOrange">!</div>

                    <div className="healthCompactText">
                      <strong>{allergy.name}</strong>
                      <span>
                        {selectedPersonId === ALL_PEOPLE_FILTER ? `${getPersonLabel(people, allergy.person_id)} · ` : ''}
                        {getAllergySummary(allergy)}
                      </span>
                    </div>

                    <span className={`healthSeverityPill healthSeverity${allergy.severity}`}>{allergy.severity}</span>

                    <div className="healthCompactActions">
                      <button
                        type="button"
                        className="healthRowEditButton"
                        onClick={() => handleStartEditAllergy(allergy)}
                        aria-label={`Edit ${allergy.name}`}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="healthDeleteButton"
                        onClick={() => handleDeleteAllergy(allergy)}
                        aria-label={`Delete ${allergy.name}`}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        )}

        {!isPageLoading && !pageError && activeSection === 'medications' && (
          <GlassCard className="healthPanelCard">
            <SectionHeader title={`Medications · ${selectedPersonLabel}`} />

            <div className="healthCleanForm healthCleanFormMedication">
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

              <button type="button" onClick={handleAddMedication} disabled={!medicationName.trim() || !effectiveAddPersonId}>
                Add
              </button>
            </div>

            <div className="healthCompactList healthCleanList">
              {filteredMedications.length === 0 ? (
                <div className="healthCompactEmptyRow">
                  <div className="healthCompactIcon tintBlue">Rx</div>
                  <div>
                    <strong>No medications saved</strong>
                    <span>Nothing saved for {selectedPersonLabel.toLowerCase()} yet.</span>
                  </div>
                </div>
              ) : (
                filteredMedications.map((medication) => (
                  <div key={medication.id} className="healthCompactRow healthMedicationRow healthCleanRow">
                    <div className="healthCompactIcon tintBlue">Rx</div>

                    <div className="healthCompactText">
                      <strong>{medication.name}</strong>
                      <span>
                        {selectedPersonId === ALL_PEOPLE_FILTER ? `${getPersonLabel(people, medication.person_id)} · ` : ''}
                        {getMedicationSummary(medication)}
                      </span>
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
        )}


        {isHealthCreateOpen && (
          <div className="healthCreateSheetOverlay" onClick={closeHealthCreateSheet}>
            <section className="healthCreateSheet" onClick={(event) => event.stopPropagation()}>
              <div className="healthCreateSheetHandle" />

              <div className="healthCreateSheetHeader">
                <div>
                  <p>Add health record</p>
                  <h2>What do you want to save?</h2>
                  <span>Choose the type first, then fill the form for {selectedPersonLabel.toLowerCase()}.</span>
                </div>

                <button type="button" onClick={closeHealthCreateSheet} aria-label="Close health create sheet">
                  ×
                </button>
              </div>

              <div className="healthCreateSheetList">
                <button type="button" onClick={() => chooseHealthCreateSection('notes')}>
                  <div className="healthCreateSheetIcon tintGreen">+</div>
                  <div>
                    <strong>Medical note</strong>
                    <span>Save an appointment, symptom, measurement, or care detail.</span>
                  </div>
                  <span className="chevron">›</span>
                </button>

                <button type="button" onClick={() => chooseHealthCreateSection('allergies')}>
                  <div className="healthCreateSheetIcon tintOrange">!</div>
                  <div>
                    <strong>Allergy</strong>
                    <span>Add an allergy, severity, and notes.</span>
                  </div>
                  <span className="chevron">›</span>
                </button>

                <button type="button" onClick={() => chooseHealthCreateSection('medications')}>
                  <div className="healthCreateSheetIcon tintBlue">Rx</div>
                  <div>
                    <strong>Medication</strong>
                    <span>Add dosage, frequency, and medication notes.</span>
                  </div>
                  <span className="chevron">›</span>
                </button>
              </div>
            </section>
          </div>
        )}
      </PageShell>
    </main>
  );
}
