'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/components/CartProvider';

export default function CheckoutPage() {
  const { cart } = useCart();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', state: '', zip: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingRate, setShippingRate] = useState(5);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(70);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        setShippingRate(Number(d.shipping_rate) || 5);
        setFreeShippingThreshold(Number(d.free_shipping_threshold) || 70);
      })
      .catch(() => {
        setShippingRate(5);
        setFreeShippingThreshold(70);
      });
  }, []);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;
  const effectiveShipping = qualifiesForFreeShipping ? 0 : shippingRate;
  const total = subtotal + effectiveShipping;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    setError('');
    if (Object.values(form).some((v) => !v.trim())) {
      setError('Please fill in every field');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((i) => ({ productId: i.productId, size: i.size, qty: i.qty })),
          customer: form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      window.location.href = data.url;
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="wrap section" style={{ textAlign: 'center' }}>
        Your bag is empty. <a href="/shop" style={{ color: 'var(--navy)', fontWeight: 600 }}>Go shop</a>
      </div>
    );
  }

  return (
    <div className="checkout">
      <div>
        <h2 style={{ fontSize: 30, marginBottom: 20 }}>Checkout</h2>
        {error && (
          <div className="test-banner" style={{ borderColor: 'var(--sale)', color: 'var(--sale)' }}>
            {error}
          </div>
        )}
        <span className="field-label">Contact</span>
        <div className="form-grid">
          <div className="form-field full">
            <label>Full Name</label>
            <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Jordan Rivers" />
          </div>
          <div className="form-field full">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@email.com" />
          </div>
          <div className="form-field full">
            <label>Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="(555) 555-5555" />
          </div>
        </div>
        <span className="field-label" style={{ marginTop: 10, display: 'block' }}>Shipping Address</span>
        <div className="form-grid">
          <div className="form-field full">
            <label>Street Address</label>
            <input value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="123 Restoration Ave" />
          </div>
          <div className="form-field">
            <label>City</label>
            <input value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Mason" />
          </div>
          <div className="form-field">
            <label>State</label>
            <input value={form.state} onChange={(e) => update('state', e.target.value)} placeholder="OH" />
          </div>
          <div className="form-field">
            <label>ZIP</label>
            <input value={form.zip} onChange={(e) => update('zip', e.target.value)} placeholder="45040" />
          </div>
        </div>
        <button className="btn btn-primary btn-block" style={{ marginTop: 10 }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Redirecting to payment…' : 'Continue to Payment'}
        </button>
        <p style={{ fontSize: 12, color: 'var(--stone-dark)', textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
          Every order is made to order — please allow 10–17 days total (1–3 days production + 9–14 days shipping).
        </p>
      </div>
      <div className="order-summary">
        <h3>Order Summary</h3>
        {!qualifiesForFreeShipping && freeShippingThreshold > 0 && (
          <p style={{ fontSize: 12, color: 'var(--orange)', marginBottom: 14, fontWeight: 600 }}>
            Add ${(freeShippingThreshold - subtotal).toFixed(2)} more for free shipping
          </p>
        )}
        {cart.map((item, idx) => (
          <div className="os-line" key={idx}>
            <span>{item.name} ({item.colorway}, {item.size}) &times;{item.qty}</span>
            <span>${(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}
        <div className="os-line"><span>Shipping</span><span>{qualifiesForFreeShipping ? 'Free' : `$${shippingRate.toFixed(2)}`}</span></div>
        <div className="os-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
      </div>
    </div>
  );
}
