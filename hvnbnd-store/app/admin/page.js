'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/admin/dashboard');
    } else {
      setError('Incorrect password');
    }
  }

  return (
    <div className="admin-gate">
      <div className="admin-gate-card">
        <span className="eyebrow">Studio Admin</span>
        <h2 style={{ fontSize: 22, margin: '14px 0 18px' }}>Sign In</h2>
        {error && <p style={{ color: 'var(--sale)', fontSize: 12, marginBottom: 10 }}>{error}</p>}
        <div className="form-field">
          <input
            type="password"
            placeholder="Studio password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>
        <button className="btn btn-primary btn-block" onClick={handleLogin} disabled={loading}>
          {loading ? 'Signing in…' : 'Enter Dashboard'}
        </button>
      </div>
    </div>
  );
}
