import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

export default function PageLoading({ title = "Loading workspace…", cards = 4, rows = 5 }: { title?: string; cards?: number; rows?: number }) {
  return (
    <main className="content loading-page">
      <div className="loading-heading">
        <span className="loading-eyebrow" />
        <span className="loading-title" />
        <span className="loading-subtitle" />
      </div>
      <div className="loading-stats" aria-hidden="true">
        {Array.from({ length: cards }).map((_, index) => <div className="loading-stat" key={index} />)}
      </div>
      <div className="panel loading-panel">
        <div className="loading-panel-title" />
        <LoadingSkeleton rows={rows} />
      </div>
      <span className="sr-only">{title}</span>
    </main>
  );
}
