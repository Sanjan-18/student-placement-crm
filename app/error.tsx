"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="content error-page">
      <div className="error-card panel">
        <div className="error-icon"><AlertTriangle size={22} /></div>
        <p className="eyebrow">WORKSPACE ERROR</p>
        <h1>We couldn’t load this page</h1>
        <p className="error-copy">Something interrupted the current screen. Your saved data has not been intentionally changed by this error page.</p>
        <div className="error-actions">
          <button className="primary" onClick={() => reset()}><RefreshCw size={15} /> Try again</button>
          <a className="secondary" href="/dashboard">Back to dashboard</a>
        </div>
        {error.digest && <small className="error-digest">Reference: {error.digest}</small>}
      </div>
    </main>
  );
}
