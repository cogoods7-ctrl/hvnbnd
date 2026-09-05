import { supabaseAdmin } from '@/lib/supabaseAdmin';
import ClearCart from '@/components/ClearCart';

export default async function SuccessPage({ searchParams }) {
  const sessionId = searchParams?.session_id;
  let order = null;

  if (sessionId) {
    const { data } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single();
    order = data;
  }

  return (
    <div className="confirm">
      <ClearCart />
      <span className="eyebrow">Order Confirmed</span>
      <h1 style={{ marginTop: 14 }}>You&apos;re All Set</h1>
      <p style={{ fontSize: 15, color: '#4a4638', lineHeight: 1.7 }}>
        Thanks for your order! A confirmation has been sent to your email, and your order is now
        in the studio queue for production.
      </p>
      <p style={{ fontSize: 13, color: 'var(--stone-dark)', lineHeight: 1.6, marginTop: 10 }}>
        Since every piece is made to order, expect 1–3 days for production and 9–14 days for
        shipping — about 10–17 days total. We'll be in touch if anything changes.
      </p>
      {order && <div className="confirm-id">Order #{order.id}</div>}
      <br />
      <a className="btn btn-primary" href="/shop">Continue Shopping</a>
    </div>
  );
}
