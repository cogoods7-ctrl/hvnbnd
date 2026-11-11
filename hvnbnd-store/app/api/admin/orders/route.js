import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  // Only orders Stripe has actually confirmed as paid ever show up here —
  // rows are inserted as "Pending Payment" the moment someone starts
  // checkout, before they've paid, and only get flipped to "Processing" by
  // the webhook once Stripe confirms the charge went through. Filtering
  // those out here means an abandoned or cancelled checkout never appears.
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .neq('status', 'Pending Payment')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request) {
  const body = await request.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: 'Missing order id' }, { status: 400 });
  if (Object.keys(fields).length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  const { error } = await supabaseAdmin.from('orders').update(fields).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
