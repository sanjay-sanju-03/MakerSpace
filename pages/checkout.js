import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Checkout() {
  const router = useRouter();
  const [membershipId, setMembershipId] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function lookup(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const id = membershipId.trim().toUpperCase();
      const resp = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: id }),
      });

      const json = await resp.json();

      if (!resp.ok) {
        setErr(json.error || 'Lookup failed');
        setLoading(false);
        return;
      }

      sessionStorage.setItem('ms_checkout_session', JSON.stringify(json.session));
      router.push('/checkout-confirm');
    } catch (e) {
      setErr(e.message || 'An error occurred');
    }

    setLoading(false);
  }

  return (
    <main className="screen">
      <div>
        <div className="title">Check-Out</div>
        <div className="subtitle">Enter your IEDC Membership ID</div>
      </div>

      <form className="card stack" onSubmit={lookup}>
        <div className="field">
          <label className="label">IEDC Membership ID</label>
          <input
            className="input"
            value={membershipId}
            onChange={(e) => { setMembershipId(e.target.value); setErr(null); }}
            required
            placeholder="e.g., IEDC24IT029"
            maxLength={16}
          />
        </div>

        {err && <div className="error">{err}</div>}

        <div className="footer-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Find My Check-In'}
          </button>
          <Link href="/" className="btn btn-outline">Back</Link>
        </div>
      </form>
    </main>
  );
}
