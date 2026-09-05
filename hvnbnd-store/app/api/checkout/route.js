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
    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address || !customer?.city || !customer?.state || !customer?.zip) {
      return NextResponse.json({ error: 'Missing shipping details' }, { status: 400 });
    }

    // Look up authoritative product data server-side — never trust prices sent from the client.
    const productIds = [...new Set(items.map((i) => i.productId))];
    const { data: products, error: prodErr } = await supabaseAdmin
      .from('products')
      .select('*')
      .in('id', productIds);
    if (prodErr) throw prodErr;

    const { data: settings } = await supabaseAdmin
      .from('settings')
      .select('shipping_rate, free_shipping_threshold')
      .eq('id', 1)
      .single();
    const shippingRate = Number(settings?.shipping_rate ?? 5);
    const freeShippingThreshold = Number(settings?.free_shipping_threshold ?? 70);

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

    // Shipping as its own Stripe line item so it's clearly itemized on the
    // Stripe checkout page and receipt. "total" here is still just the item
    // subtotal — checked against the dollar threshold before shipping is
    // added below.
    const effectiveShippingRate = total >= freeShippingThreshold ? 0 : shippingRate;
    if (effectiveShippingRate > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Shipping' },
          unit_amount: Math.round(effectiveShippingRate * 100),
        },
        quantity: 1,
      });
      total += effectiveShippingRate;
    }

    const orderId = 'HVN' + Date.now().toString().slice(-8);

    // Create a Customer with the address they already gave us, so Stripe Tax
    // can calculate the right tax without asking them to enter their
    // address a second time on Stripe's own page. This does nothing unless
    // you've enabled Stripe Tax and added a state registration in your
    // Stripe dashboard — until then, automatic_tax simply won't add tax.
    const stripeCustomer = await stripe.customers.create({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: {
        line1: customer.address,
        city: customer.city,
        state: customer.state,
        postal_code: customer.zip,
        country: 'US',
      },
    });

    // Stripe Tax is OFF by default. Turning on automatic_tax before you've
    // configured Stripe Tax (origin address + at least one state
    // registration) in your Stripe dashboard can make checkout error out
    // entirely — so this only activates once you explicitly set
    // STRIPE_TAX_ENABLED=true in your environment variables, which you
    // should only do after registering in Stripe's Tax settings.
    const taxEnabled = process.env.STRIPE_TAX_ENABLED === 'true';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer: stripeCustomer.id,
      allow_promotion_codes: true,
      ...(taxEnabled ? { automatic_tax: { enabled: true } } : {}),
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
      metadata: { order_id: orderId },
    });

    const { error: insertErr } = await supabaseAdmin.from('orders').insert({
      id: orderId,
      stripe_session_id: session.id,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zip: customer.zip,
      items: orderItems,
      total,
      shipping_cost: effectiveShippingRate,
      status: 'Pending Payment',
    });
    if (insertErr) throw insertErr;

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('checkout error:', err);
    return NextResponse.json({ error: 'Could not start checkout. Please try again.' }, { status: 500 });
  }
}
