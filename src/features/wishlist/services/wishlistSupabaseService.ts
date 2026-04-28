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

export type WishlistItemInput = {
  title: string;
  note?: string;
  link?: string;
  priority?: string;
  occasion?: string;
  ownerId?: string;
};

const WISHLIST_SELECT = 'id, household_id, owner_id, title, link, note, priority, occasion, created_at';

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

function normalizeWishlistInput(input: WishlistItemInput) {
  return {
    title: input.title.trim(),
    note: input.note?.trim() || '',
    link: input.link?.trim() || '',
    priority: input.priority?.trim() || 'medium',
    occasion: input.occasion?.trim() || '',
  };
}

export async function fetchWishlistItems(): Promise<WishlistItem[]> {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();

  const { data, error } = await supabase
    .from('wishlist_items')
    .select(WISHLIST_SELECT)
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapRowToWishlistItem);
}

export async function insertWishlistItem(input: WishlistItemInput) {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();
  const personId = input.ownerId || (await getCurrentPersonId());
  const normalizedInput = normalizeWishlistInput(input);

  const { data, error } = await supabase
    .from('wishlist_items')
    .insert({
      household_id: householdId,
      owner_id: personId,
      title: normalizedInput.title,
      note: normalizedInput.note,
      priority: normalizedInput.priority,
      occasion: normalizedInput.occasion,
      link: normalizedInput.link,
    })
    .select(WISHLIST_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapRowToWishlistItem(data);
}

export async function updateWishlistItem(id: string, input: WishlistItemInput) {
  const supabase = requireSupabaseClient();
  const householdId = await getCurrentHouseholdId();
  const normalizedInput = normalizeWishlistInput(input);

  const updatePayload: {
    title: string;
    note: string;
    link: string;
    priority: string;
    occasion: string;
    owner_id?: string;
  } = {
    title: normalizedInput.title,
    note: normalizedInput.note,
    link: normalizedInput.link,
    priority: normalizedInput.priority,
    occasion: normalizedInput.occasion,
  };

  if (input.ownerId) {
    updatePayload.owner_id = input.ownerId;
  }

  const { data, error } = await supabase
    .from('wishlist_items')
    .update(updatePayload)
    .eq('id', id)
    .eq('household_id', householdId)
    .select(WISHLIST_SELECT)
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
