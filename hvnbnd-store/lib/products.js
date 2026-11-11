import { supabase } from './supabaseClient';

// Products with the same group_id are colorways of ONE product (e.g. every
// color of "Made for Higher Tee"). Each colorway is still its own row — that
// keeps stock, pricing, checkout and orders per-color — but the shop only
// shows one card per group, and the product page lets you switch colors.
function collapseGroups(rows) {
  const groups = new Map();
  rows.forEach((p) => {
    if (!p.group_id) return;
    if (!groups.has(p.group_id)) groups.set(p.group_id, []);
    groups.get(p.group_id).push(p);
  });
  groups.forEach((list) => list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));

  const emitted = new Set();
  const out = [];
  rows.forEach((p) => {
    if (!p.group_id) {
      out.push(p);
      return;
    }
    if (emitted.has(p.group_id)) return;
    emitted.add(p.group_id);
    const list = groups.get(p.group_id);
    const base = list.find((v) => v.is_default) || list[0];
    out.push({ ...base, variants: list });
  });
  return out;
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('getProducts error:', error.message);
    return [];
  }
  return collapseGroups(data);
}

export async function getProduct(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export async function getVariants(groupId) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('group_id', groupId)
    .order('sort_order', { ascending: true });
  if (error || !data) return [];
  return data;
}
