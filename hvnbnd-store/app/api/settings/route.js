import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Force this to run fresh on every request — otherwise Next.js will bake
// the shipping rate in at build time and admin changes won't show up live.
export const dynamic = 'force-dynamic';

// Public, read-only — used by the checkout page to show the current
// shipping rate. Safe to expose (no sensitive data).
export async function GET() {
  const { data, error } = await supabase
    .from('settings')
    .select('shipping_rate, free_shipping_threshold')
    .eq('id', 1)
    .single();
  if (error) {
    // Fail safe with sane defaults rather than breaking checkout entirely.
    return NextResponse.json({ shipping_rate: 5, free_shipping_threshold: 75 });
  }
  return NextResponse.json(data);
}
