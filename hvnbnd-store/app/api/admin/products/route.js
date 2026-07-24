import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const { data, error } = await supabaseAdmin.from('products').select('*').order('created_at');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request) {
  const body = await request.json();
  const id = 'p' + Date.now();
  const { error } = await supabaseAdmin.from('products').insert({
    id,
    name: body.name,
    colorway: body.colorway,
    category: body.category || 'Tee',
    price: Number(body.price) || 0,
    stock: Number(body.stock) || 0,
    sizes: ['S', 'M', 'L', 'XL'],
    image_front: body.image_front || '/images/logo_white_front.jpg',
    image_back: body.image_back || null,
    tapstitch_id: body.tapstitch_id || '',
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id });
}

export async function PATCH(request) {
  const body = await request.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: 'Missing product id' }, { status: 400 });
  const { error } = await supabaseAdmin.from('products').update(fields).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  const { id } = await request.json();
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
