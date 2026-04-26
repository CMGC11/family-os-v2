import { requireSupabaseClient } from '../../../lib/supabase/client';
import { getCurrentHouseholdId } from '../../../lib/supabase/household';
import { getCurrentPersonId } from '../../../lib/supabase/person';
import type { WishlistItem } from '../types';

type WishlistRow = {
  id: string;
  household_id: string;
  owner_id: string;
  title: string;
  link: string | null;
  note: string | null;
  priority: string | null;
  occasion: string | null;
  created_at: string | null;
};

function mapRowToWishlistItem(row: WishlistRow): WishlistItem {
  return {
    id: row.id,
    household_id: row.household_id,
    owner_id: row.owner_id,
    title: row.title,
    link: row.link?.trim() || '',
    note: row.note?.trim() || '',
    priority: row.priority?.trim() || 'medium',
    occasion: row.occasion?.trim() || '',
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

export async function fetchWishlistItems(): Promise<WishlistItem[]> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('wishlist_items')
    .select('id, household_id, owner_id, title, link, note, priority, occasion, created_at')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapRowToWishlistItem);
}

export async function insertWishlistItem(title: string, note = '') {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();
  const personId = await getCurrentPersonId();

  const { data, error } = await supabase
    .from('wishlist_items')
    .insert({
      household_id: householdId,
      owner_id: personId,
      title,
      note,
      priority: 'medium',
      occasion: '',
      link: '',
    })
    .select('id, household_id, owner_id, title, link, note, priority, occasion, created_at')
    .single();

  if (error) {
    throw error;
  }

  return mapRowToWishlistItem(data);
}

export async function deleteWishlistItem(id: string): Promise<void> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('id', id)
    .eq('household_id', householdId);

  if (error) {
    throw error;
  }
}