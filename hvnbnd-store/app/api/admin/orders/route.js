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
  const { id, status } = await request.json();
  if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
  const { error } = await supabaseAdmin.from('orders').update({ status }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
