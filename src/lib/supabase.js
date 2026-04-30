import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase env vars. Create a .env file with:\n' +
    'VITE_SUPABASE_URL=...\n' +
    'VITE_SUPABASE_ANON_KEY=...'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const PAGE_SIZE = 10;

// ── Data helpers ─────────────────────────────────────────────

/** Fetch paginated posts, newest first, optionally filtered by category */
export async function fetchPosts({ pageParam = 0, categoryId = null }) {
  const from = pageParam * PAGE_SIZE;
  const to   = from + PAGE_SIZE - 1;

  let query = supabase
    .from('posts')
    .select('*, categories(id, name, slug)')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** Fetch all categories */
export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

/** Increment likes on a post (non-atomic shortcut — use DB function for production) */
export async function incrementLike(postId, currentLikes) {
  const { error } = await supabase
    .from('posts')
    .update({ likes: currentLikes + 1 })
    .eq('id', postId);
  if (error) throw error;
}

export async function decrementLike(postId, currentLikes) {
  const { error } = await supabase
    .from('posts')
    .update({ likes: Math.max(0, currentLikes - 1) })
    .eq('id', postId);
  if (error) throw error;
}
