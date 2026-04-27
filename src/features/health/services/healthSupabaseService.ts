import { requireSupabaseClient } from '../../../lib/supabase/client';
import { getCurrentHouseholdId } from '../../../lib/supabase/household';
import { getCurrentPersonId } from '../../../lib/supabase/person';
import type { MedicalNote } from '../types';

type MedicalNoteRow = {
  id: string;
  household_id: string;
  person_id: string;
  title: string;
  content: string | null;
  date: string | null;
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

export async function fetchMedicalNotes(): Promise<MedicalNote[]> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('medical_notes')
    .select('id, household_id, person_id, title, content, date, created_at')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapRowToMedicalNote);
}

export async function insertMedicalNote(title: string, content: string, date: string) {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();
  const personId = await getCurrentPersonId();

  const { data, error } = await supabase
    .from('medical_notes')
    .insert({
      household_id: householdId,
      person_id: personId,
      title,
      content,
      date,
    })
    .select('id, household_id, person_id, title, content, date, created_at')
    .single();

  if (error) {
    throw error;
  }

  return mapRowToMedicalNote(data);
}

export async function deleteMedicalNote(id: string): Promise<void> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { error } = await supabase
    .from('medical_notes')
    .delete()
    .eq('id', id)
    .eq('household_id', householdId);

  if (error) {
    throw error;
  }
}