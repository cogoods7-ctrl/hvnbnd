'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const [oRes, pRes] = await Promise.all([fetch('/api/admin/orders'), fetch('/api/admin/products')]);
    setOrders(oRes.ok ? await oRes.json() : []);
    setProducts(pRes.ok ? await pRes.json() : []);
    setLoading(false);
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  }

  async function updateOrderStatus(id, status) {
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    loadAll();
  }

  async function updateProductField(id, field, value) {
    await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, [field]: value }),
    });
    loadAll();
  }

  async function deleteProduct(id) {
    await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    loadAll();
  }

  async function addProduct(form) {
    await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    loadAll();
  }

  if (loading) {
    return <div className="wrap" style={{ padding: '100px 0', textAlign: 'center' }}>Loading dashboard…</div>;
  }

  const paidOrders = orders.filter((o) => o.status !== 'Pending Payment');
  const revenue = paidOrders.reduce((s, o) => s + Number(o.total), 0);
  const count = paidOrders.length;
  const avg = count ? revenue / count : 0;
  const unitsSold = paidOrders.reduce((s, o) => s + (o.items || []).reduce((a, i) => a + i.qty, 0), 0);
  const lowStock = products.filter((p) => p.stock < 10);

  return (
    <div className="admin-shell">
      <div className="admin-head">
        <div>
          <span className="eyebrow">Studio Admin</span>
          <h2 style={{ fontSize: 26, marginTop: 8 }}>Dashboard</h2>
        </div>
        <button className="mini-btn" onClick={logout}>Log Out</button>
      </div>
      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
        <button className={`admin-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>Orders</button>
        <button className={`admin-tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>Products</button>
      </div>

      {tab === 'overview' && (
        <>
          <div className="kpi-row">
            <div className="kpi"><div className="label">Revenue</div><div className="value">${revenue.toFixed(2)}</div></div>
            <div className="kpi"><div className="label">Paid Orders</div><div className="value">{count}</div></div>
            <div className="kpi"><div className="label">Avg Order Value</div><div className="value">${avg.toFixed(2)}</div></div>
            <div className="kpi"><div className="label">Units Sold</div><div className="value">{unitsSold}</div></div>
          </div>
          <div className="admin-panel">
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Low Stock Alerts</h3>
            {lowStock.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--stone-dark)' }}>Everything is well stocked.</p>
            ) : (
              <table>
                <thead><tr><th>Product</th><th>Colorway</th><th>Stock Left</th></tr></thead>
                <tbody>
                  {lowStock.map((p) => (
                    <tr key={p.id}><td>{p.name}</td><td>{p.colorway}</td><td>{p.stock}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="admin-panel">
            <h3 style={{ fontSize: 15, marginBottom: 6 }}>Tapstitch Fulfillment</h3>
            <p style={{ fontSize: 13, color: 'var(--stone-dark)', lineHeight: 1.6 }}>
              Paid orders land here automatically once Stripe confirms payment (via the webhook).
              Push each order&apos;s items to Tapstitch for production using the Tapstitch Product ID
              logged against each item in the Products tab.
            </p>
          </div>
        </>
      )}

      {tab === 'orders' && (
        orders.length === 0 ? (
          <div className="empty-state">No orders yet. Orders placed at checkout will show up here.</div>
        ) : (
          <table>
            <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.customer_name}<br /><span style={{ color: 'var(--stone-dark)', fontSize: 11 }}>{o.customer_email}</span></td>
                  <td>{(o.items || []).reduce((s, i) => s + i.qty, 0)} item(s)</td>
                  <td>${Number(o.total).toFixed(2)}</td>
                  <td>
                    <select className="status-select" value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)}>
                      {['Pending Payment', 'Processing', 'Shipped', 'Fulfilled'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {tab === 'products' && (
        <ProductsTab products={products} onUpdate={updateProductField} onDelete={deleteProduct} onAdd={addProduct} />
      )}
    </div>
  );
}

function ProductsTab({ products, onUpdate, onDelete, onAdd }) {
  const [form, setForm] = useState({ name: '', colorway: '', price: '', stock: '', category: '', tapstitch_id: '' });

  return (
    <>
      <div className="admin-panel">
        <h3 style={{ fontSize: 15, marginBottom: 14 }}>Add Product</h3>
        <div className="add-product-form">
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Colorway" value={form.colorway} onChange={(e) => setForm({ ...form, colorway: e.target.value })} />
          <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input placeholder="Tapstitch Product ID" value={form.tapstitch_id} onChange={(e) => setForm({ ...form, tapstitch_id: e.target.value })} />
          <button
            className="mini-btn"
            onClick={() => {
              onAdd(form);
              setForm({ name: '', colorway: '', price: '', stock: '', category: '', tapstitch_id: '' });
            }}
          >
            + Add
          </button>
        </div>
        <p className="drawer-note" style={{ textAlign: 'left', marginTop: 10 }}>
          New products use a placeholder photo — upload real product images to /public/images in the
          project and update the image path in Supabase once ready.
        </p>
      </div>
      <table>
        <thead><tr><th>Photo</th><th>Product</th><th>Colorway</th><th>Price</th><th>Stock</th><th>Tapstitch ID</th><th></th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td><img src={p.image_front} style={{ width: 38, height: 46, objectFit: 'cover' }} alt="" /></td>
              <td>{p.name}</td>
              <td>{p.colorway}</td>
              <td>${Number(p.price).toFixed(2)}</td>
              <td>
                <input
                  type="number"
                  defaultValue={p.stock}
                  style={{ width: 60, border: '1px solid var(--line)', padding: '4px 6px' }}
                  onBlur={(e) => onUpdate(p.id, 'stock', Number(e.target.value))}
                />
              </td>
              <td>
                <input
                  defaultValue={p.tapstitch_id || ''}
                  placeholder="not linked"
                  style={{ width: 120, border: '1px solid var(--line)', padding: '4px 6px' }}
                  onBlur={(e) => onUpdate(p.id, 'tapstitch_id', e.target.value)}
                />
              </td>
              <td>
                <a
                  href="#"
                  style={{ color: 'var(--sale)', fontSize: 12, fontWeight: 600 }}
                  onClick={(e) => { e.preventDefault(); onDelete(p.id); }}
                >
                  Remove
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
