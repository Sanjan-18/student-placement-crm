import { headers } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import WorkspaceShell from "@/components/layout/WorkspaceShell";
import FCMRegistrar from "@/components/notifications/FCMRegistrar";
import ReminderCenter from "@/components/notifications/ReminderCenter";

function isPublicPath(pathname: string) {
  return pathname === "/" || pathname === "/login" || pathname.startsWith("/api/");
}

function activeFromPath(pathname: string) {
  const rules: Array<[string, string]> = [
    ["/saved-opportunities", "saved-opportunities"], ["/my-applications", "my-applications"],
    ["/placement-readiness", "placement-readiness"], ["/interview-hub", "interview-hub"],
    ["/offer-center", "offer-center"], ["/opportunities", "opportunities"],
    ["/documents", "documents"], ["/notifications", "notifications"], ["/settings", "notifications"], ["/profile", "profile"],
    ["/calendar", "calendar"], ["/tasks", "tasks"], ["/students", "students"],
    ["/companies", "companies"], ["/drives", "drives"], ["/applications", "applications"],
    ["/interviews", "interviews"], ["/pipeline", "pipeline"], ["/offers", "offers"],
    ["/recruiters", "recruiters"], ["/activities", "activities"], ["/eligibility", "eligibility"],
    ["/analytics", "analytics"], ["/reports", "reports"], ["/email", "email"],
    ["/announcements", "announcements"], ["/recruiter-dashboard", "recruiter-dashboard"],
    ["/recruiter-portal", "recruiter-portal"], ["/admin/users", "admin-users"],
    ["/admin/control-center", "admin-control-center"], ["/admin/audit", "admin-audit"], ["/admin", "admin"],
  ];
  return rules.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`))?.[1] ?? "dashboard";
}

export default async function GlobalWorkspace({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-placement-pathname") || "/";
  if (isPublicPath(pathname)) return <>{children}</>;

  const session = await auth();
  if (!session?.user?.email) return <>{children}</>;

  const unread = await prisma.notification.count({
    where: { user: { email: session.user.email }, isRead: false },
  }).catch(() => 0);

  return (
    <>
      <FCMRegistrar />
      <ReminderCenter />
      <WorkspaceShell role={session.user.role} active={activeFromPath(pathname)} notificationCount={unread} global>
        {children}
      </WorkspaceShell>
    </>
  );
}
