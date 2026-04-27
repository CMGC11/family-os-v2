export type MedicalNote = {
  id: string;
  household_id: string;
  person_id: string;
  title: string;
  content: string;
  date: string;
  created_at: string;
};

export type Allergy = {
  id: string;
  household_id: string;
  person_id: string;
  name: string;
  severity: string;
  notes: string;
  created_at: string;
};

export type Medication = {
  id: string;
  household_id: string;
  person_id: string;
  name: string;
  dosage: string;
  frequency: string;
  notes: string;
  created_at: string;
};
