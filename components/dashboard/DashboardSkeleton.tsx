export default function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton" aria-hidden="true">
      <div className="dashboard-skeleton-heading">
        <span className="skeleton-line skeleton-eyebrow" />
        <span className="skeleton-line skeleton-title" />
        <span className="skeleton-line skeleton-subtitle" />
      </div>
      <div className="dashboard-skeleton-kpis">
        {Array.from({ length: 4 }).map((_, index) => <div className="skeleton-card" key={index} />)}
      </div>
      <div className="dashboard-skeleton-health">
        <div className="skeleton-card skeleton-health-card" />
        <div className="skeleton-card skeleton-action-card" />
        <div className="skeleton-card skeleton-action-card" />
      </div>
      <div className="dashboard-skeleton-grid">
        <div className="skeleton-card skeleton-large-card" />
        <div className="skeleton-card skeleton-large-card" />
      </div>
    </div>
  );
}
