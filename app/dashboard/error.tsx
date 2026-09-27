"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="dashboard-error content">
      <section className="panel dashboard-error-card" role="alert">
        <div className="dashboard-error-icon"><AlertTriangle size={22} /></div>
        <p className="eyebrow">DASHBOARD ERROR</p>
        <h1>We couldn’t load your dashboard</h1>
        <p>There was a temporary problem loading your placement data. Your account and stored records were not intentionally changed.</p>
        <div className="error-actions">
          <button className="primary" onClick={() => reset()}><RefreshCw size={15} /> Try again</button>
          <a className="secondary" href="/notifications">Open notifications</a>
        </div>
        {error.digest && <small className="error-digest">Reference: {error.digest}</small>}
      </section>
    </main>
  );
}
