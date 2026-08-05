'use client';

import { useState } from 'react';

export default function EnterPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [interestSubmitted, setInterestSubmitted] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);
  const [interestError, setInterestError] = useState('');

  async function handleUnlock() {
    setLoading(true);
    setError('');
    const res = await fetch('/api/site-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      window.location.href = '/';
    } else {
      setError('Incorrect password');
    }
  }

  async function handleInterest() {
    if (!email.trim()) {
      setInterestError('Please enter your email');
      return;
    }
    setInterestLoading(true);
    setInterestError('');
    try {
      const res = await fetch('https://formspree.io/f/xvzejrry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      if (res.ok) {
        setInterestSubmitted(true);
      } else {
        setInterestError('Something went wrong — please try again.');
      }
    } catch (e) {
      setInterestError('Something went wrong — please try again.');
    }
    setInterestLoading(false);
  }

  return (
    <div className="admin-gate">
      <div className="admin-gate-card" style={{ maxWidth: 400 }}>
        <img src="/images/logo.png" alt="hvnbnd apparel" style={{ height: 44, margin: '0 auto 20px', display: 'block' }} />
        <span className="eyebrow">Coming Soon</span>
        <h2 style={{ fontSize: 21, margin: '14px 0 10px' }}>We&apos;re Putting the Finishing Touches On Things</h2>
        <p style={{ fontSize: 13, color: 'var(--stone-dark)', lineHeight: 1.6, marginBottom: 22 }}>
          hvnbnd apparel is almost ready. Enter the password below if you have early access, or leave
          your email and we&apos;ll let you know the moment we launch.
        </p>

        {error && <p style={{ color: 'var(--sale)', fontSize: 12, marginBottom: 10 }}>{error}</p>}
        <div className="form-field">
          <input
            type="password"
            placeholder="Access password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
          />
        </div>
        <button className="btn btn-primary btn-block" onClick={handleUnlock} disabled={loading}>
          {loading ? 'Checking…' : 'Enter Site'}
        </button>

        <div style={{ borderTop: '1px solid var(--line)', margin: '28px 0 20px' }}></div>

        <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 12 }}>
          Get Notified When We Launch
        </h3>
        {interestSubmitted ? (
          <p style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 600 }}>You&apos;re on the list — thank you!</p>
        ) : (
          <>
            {interestError && <p style={{ color: 'var(--sale)', fontSize: 12, marginBottom: 10 }}>{interestError}</p>}
            <div className="form-field">
              <input placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-field">
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button className="btn btn-outline btn-block" onClick={handleInterest} disabled={interestLoading}>
              {interestLoading ? 'Submitting…' : 'Notify Me'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
