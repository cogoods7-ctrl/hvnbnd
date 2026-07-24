import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, customer } = body || {};

    if (!items || !items.length) {
      return NextResponse.json({ error: 'Your bag is empty' }, { status: 400 });
    }
    if (!customer?.name || !customer?.email || !customer?.address || !customer?.city || !customer?.state || !customer?.zip) {
      return NextResponse.json({ error: 'Missing shipping details' }, { status: 400 });
    }

    // Look up authoritative product data server-side — never trust prices sent from the client.
    const productIds = [...new Set(items.map((i) => i.productId))];
    const { data: products, error: prodErr } = await supabaseAdmin
      .from('products')
      .select('*')
      .in('id', productIds);
    if (prodErr) throw prodErr;

    const lineItems = [];
    const orderItems = [];
    let total = 0;

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json({ error: 'A product in your bag no longer exists' }, { status: 400 });
      }
      if (product.stock < item.qty) {
        return NextResponse.json(
          { error: `${product.name} (${product.colorway}) doesn't have enough stock left` },
          { status: 400 }
        );
      }
      const unitAmount = Math.round(Number(product.price) * 100);
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: `${product.name} — ${product.colorway} (${item.size})` },
          unit_amount: unitAmount,
        },
        quantity: item.qty,
      });
      orderItems.push({
        productId: product.id,
        name: product.name,
        colorway: product.colorway,
        size: item.size,
        qty: item.qty,
        price: Number(product.price),
      });
      total += Number(product.price) * item.qty;
    }

    const orderId = 'HVN' + Date.now().toString().slice(-8);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: customer.email,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
      metadata: { order_id: orderId },
    });

    const { error: insertErr } = await supabaseAdmin.from('orders').insert({
      id: orderId,
      stripe_session_id: session.id,
      customer_name: customer.name,
      customer_email: customer.email,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zip: customer.zip,
      items: orderItems,
      total,
      status: 'Pending Payment',
    });
    if (insertErr) throw insertErr;

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('checkout error:', err);
    return NextResponse.json({ error: 'Could not start checkout. Please try again.' }, { status: 500 });
  }
}
