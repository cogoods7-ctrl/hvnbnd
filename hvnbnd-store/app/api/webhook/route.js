import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe sends the raw request body here to verify the signature — this is
// the source of truth for "was this order actually paid", not the client
// redirect on the success page.
export async function POST(request) {
  const sig = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;

    if (orderId) {
      const { data: order } = await supabaseAdmin.from('orders').select('*').eq('id', orderId).single();

      if (order && order.status === 'Pending Payment') {
        // amount_total / total_details.amount_tax are Stripe's authoritative
        // final numbers — if Stripe Tax is on, this is where the real tax
        // collected actually gets recorded against the order.
        const finalTotal = session.amount_total != null ? session.amount_total / 100 : order.total;
        const taxAmount = session.total_details?.amount_tax != null ? session.total_details.amount_tax / 100 : 0;

        // Re-fetch the session with the discount details expanded so we can
        // see exactly which promotion code (if any) was used — the webhook
        // payload alone doesn't include this without asking for it.
        let promoCode = null;
        let discountAmount = 0;
        try {
          const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['total_details.breakdown.discounts.discount.promotion_code'],
          });
          const discounts = fullSession.total_details?.breakdown?.discounts || [];
          if (discounts.length > 0) {
            discountAmount = discounts.reduce((s, d) => s + (d.amount || 0), 0) / 100;
            promoCode = discounts[0]?.discount?.promotion_code?.code || null;
          }
        } catch (e) {
          console.error('Could not fetch discount details:', e.message);
        }

        await supabaseAdmin
          .from('orders')
          .update({
            status: 'Processing',
            total: finalTotal,
            tax_amount: taxAmount,
            promo_code: promoCode,
            discount_amount: discountAmount,
          })
          .eq('id', orderId);

        for (const item of order.items) {
          const { data: product } = await supabaseAdmin
            .from('products')
            .select('stock')
            .eq('id', item.productId)
            .single();
          if (product) {
            const newStock = Math.max(0, product.stock - item.qty);
            await supabaseAdmin.from('products').update({ stock: newStock }).eq('id', item.productId);
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
