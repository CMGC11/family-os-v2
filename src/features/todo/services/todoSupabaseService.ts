import { requireSupabaseClient } from '../../../lib/supabase/client';
import type { TaskItem } from '../types';

const HOUSEHOLD_ID = '11111111-1111-1111-1111-111111111111';

type TodoRow = {
  id: string;
  household_id: string;
  title: string;
  area: string | null;
  due: string | null;
  is_done: boolean | null;
  created_at: string | null;
};

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

  const { data, error } = await supabase
    .from('todo_items')
    .select('id, household_id, title, area, due, is_done, created_at')
    .eq('household_id', HOUSEHOLD_ID)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapRowToTask);
}

export async function insertTodoItem(title: string, area: string, due: string) {
  const supabase = requireSupabaseClient();

  const { data, error } = await supabase
    .from('todo_items')
    .insert({
      household_id: '11111111-1111-1111-1111-111111111111',
      title,
      area,
      due,
      is_done: false,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}