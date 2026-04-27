import { requireSupabaseClient } from '../../../lib/supabase/client';
import { getCurrentHouseholdId } from '../../../lib/supabase/household';
import { getCurrentPersonId } from '../../../lib/supabase/person';
import type { Allergy, MedicalNote, Medication } from '../types';

type MedicalNoteRow = {
  id: string;
  household_id: string;
  person_id: string;
  title: string;
  content: string | null;
  date: string | null;
  created_at: string | null;
};

type AllergyRow = {
  id: string;
  household_id: string;
  person_id: string;
  name: string;
  severity: string | null;
  notes: string | null;
  created_at: string | null;
};

type MedicationRow = {
  id: string;
  household_id: string;
  person_id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  notes: string | null;
  created_at: string | null;
};

function mapRowToMedicalNote(row: MedicalNoteRow): MedicalNote {
  return {
    id: row.id,
    household_id: row.household_id,
    person_id: row.person_id,
    title: row.title,
    content: row.content?.trim() || '',
    date: row.date?.trim() || '',
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

function mapRowToAllergy(row: AllergyRow): Allergy {
  return {
    id: row.id,
    household_id: row.household_id,
    person_id: row.person_id,
    name: row.name,
    severity: row.severity?.trim() || 'moderate',
    notes: row.notes?.trim() || '',
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

function mapRowToMedication(row: MedicationRow): Medication {
  return {
    id: row.id,
    household_id: row.household_id,
    person_id: row.person_id,
    name: row.name,
    dosage: row.dosage?.trim() || '',
    frequency: row.frequency?.trim() || '',
    notes: row.notes?.trim() || '',
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

export async function fetchMedicalNotes(): Promise<MedicalNote[]> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('medical_notes')
    .select('id, household_id, person_id, title, content, date, created_at')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map(mapRowToMedicalNote);
}

export async function insertMedicalNote(title: string, content: string, date: string) {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();
  const personId = await getCurrentPersonId();

  const { data, error } = await supabase
    .from('medical_notes')
    .insert({ household_id: householdId, person_id: personId, title, content, date })
    .select('id, household_id, person_id, title, content, date, created_at')
    .single();

  if (error) throw error;

  return mapRowToMedicalNote(data);
}

export async function deleteMedicalNote(id: string): Promise<void> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { error } = await supabase.from('medical_notes').delete().eq('id', id).eq('household_id', householdId);

  if (error) throw error;
}

export async function fetchAllergies(): Promise<Allergy[]> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('allergies')
    .select('id, household_id, person_id, name, severity, notes, created_at')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map(mapRowToAllergy);
}

export async function insertAllergy(name: string, severity: string, notes: string): Promise<Allergy> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();
  const personId = await getCurrentPersonId();

  const { data, error } = await supabase
    .from('allergies')
    .insert({ household_id: householdId, person_id: personId, name, severity, notes })
    .select('id, household_id, person_id, name, severity, notes, created_at')
    .single();

  if (error) throw error;

  return mapRowToAllergy(data);
}

export async function deleteAllergy(id: string): Promise<void> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { error } = await supabase.from('allergies').delete().eq('id', id).eq('household_id', householdId);

  if (error) throw error;
}

export async function fetchMedications(): Promise<Medication[]> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('medications')
    .select('id, household_id, person_id, name, dosage, frequency, notes, created_at')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map(mapRowToMedication);
}

export async function insertMedication(
  name: string,
  dosage: string,
  frequency: string,
  notes: string,
): Promise<Medication> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();
  const personId = await getCurrentPersonId();

  const { data, error } = await supabase
    .from('medications')
    .insert({ household_id: householdId, person_id: personId, name, dosage, frequency, notes })
    .select('id, household_id, person_id, name, dosage, frequency, notes, created_at')
    .single();

  if (error) throw error;

  return mapRowToMedication(data);
}

export async function deleteMedication(id: string): Promise<void> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { error } = await supabase.from('medications').delete().eq('id', id).eq('household_id', householdId);

  if (error) throw error;
}
