import { requireSupabaseClient } from '../../../lib/supabase/client';
import { getCurrentHouseholdId } from '../../../lib/supabase/household';
import type { TaskItem } from '../types';

type TodoRow = {
  id: string;
  household_id: string;
  title: string;
  area: string | null;
  due: string | null;
  is_done: boolean | null;
  created_at: string | null;
};

const TODO_SELECT = 'id, household_id, title, area, due, is_done, created_at';

function mapRowToTask(row: TodoRow): TaskItem {
  return {
    id: row.id,
    household_id: row.household_id,
    title: row.title,
    area: row.area?.trim() || 'Family',
    due: row.due?.trim() || 'Today',
    done: Boolean(row.is_done),
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

export async function fetchTodoItems(): Promise<TaskItem[]> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('todo_items')
    .select(TODO_SELECT)
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapRowToTask);
}

export async function insertTodoItem(title: string, area: string, due: string): Promise<TaskItem> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('todo_items')
    .insert({
      household_id: householdId,
      title,
      area,
      due,
      is_done: false,
    })
    .select(TODO_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapRowToTask(data);
}

export async function updateTodoItem(
  id: string,
  input: { title: string; area: string; due: string },
): Promise<TaskItem> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('todo_items')
    .update({
      title: input.title,
      area: input.area,
      due: input.due,
    })
    .eq('id', id)
    .eq('household_id', householdId)
    .select(TODO_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapRowToTask(data);
}

export async function updateTodoItemDone(id: string, done: boolean): Promise<void> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { error } = await supabase
    .from('todo_items')
    .update({
      is_done: done,
    })
    .eq('id', id)
    .eq('household_id', householdId);

  if (error) {
    throw error;
  }
}

export async function deleteTodoItem(id: string): Promise<void> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { error } = await supabase
    .from('todo_items')
    .delete()
    .eq('id', id)
    .eq('household_id', householdId);

  if (error) {
    throw error;
  }
}
