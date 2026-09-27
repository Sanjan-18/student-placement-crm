import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

export default function DashboardLoading() {
  return (
    <main className="dashboard-loading content" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your placement dashboard</span>
      <DashboardSkeleton />
    </main>
  );
}
