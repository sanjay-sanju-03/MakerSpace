import Link from 'next/link';

export default function Home() {
  return (
    <main className="screen">
      <div className="stack">
        <div>
          <div className="title">Makerspace Access</div>
          <div className="subtitle">Choose an action to continue</div>
        </div>
        <div className="card stack">
          <Link href="/checkin-type" className="btn btn-primary">Check-In</Link>
          <Link href="/checkout-lookup" className="btn btn-outline">Check-Out</Link>
        </div>
      </div>
    </main>
  );
}
