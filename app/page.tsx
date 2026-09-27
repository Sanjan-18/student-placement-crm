import Link from "next/link";

export default function Home() {
  return (
    <main className="landing">
      <div className="hero-card">
        <div className="badge">STUDENT PLACEMENT CRM</div>
        <h1>Placement management, <span>simplified.</span></h1>
        <p>Manage students, companies, placement drives, applications, interviews, offers and real-time notifications from one platform.</p>
        <div className="actions">
          <Link className="primary" href="/login">Continue with Google</Link>
          <Link className="secondary" href="/dashboard">View Dashboard</Link>
        </div>
      </div>
    </main>
  );
}
