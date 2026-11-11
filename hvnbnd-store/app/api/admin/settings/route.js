import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const { data, error } = await supabaseAdmin.from('settings').select('*').eq('id', 1).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request) {
  const body = await request.json();
  const shipping_rate = Number(body.shipping_rate);
  const free_shipping_threshold = Number(body.free_shipping_threshold);
  if (Number.isNaN(shipping_rate) || shipping_rate < 0) {
    return NextResponse.json({ error: 'Shipping rate must be a positive number' }, { status: 400 });
  }
  if (Number.isNaN(free_shipping_threshold) || free_shipping_threshold < 0) {
    return NextResponse.json({ error: 'Free shipping threshold must be a positive number' }, { status: 400 });
  }
  const { error } = await supabaseAdmin
    .from('settings')
    .update({ shipping_rate, free_shipping_threshold, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
