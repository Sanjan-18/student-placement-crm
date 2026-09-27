"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity, BarChart3, Bell, BriefcaseBusiness, Building2, CalendarDays,
  ClipboardCheck, FileText, FolderKanban, GraduationCap, Handshake,
  LayoutDashboard, Mail, ShieldCheck, Users, UserRound, Workflow,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  dashboard: LayoutDashboard,
  opportunities: BriefcaseBusiness,
  "saved-opportunities": FolderKanban,
  "my-applications": FileText,
  tasks: ClipboardCheck,
  calendar: CalendarDays,
  "interview-hub": CalendarDays,
  "offer-center": Handshake,
  "placement-readiness": ShieldCheck,
  documents: FileText,
  notifications: Bell,
  profile: UserRound,
  students: GraduationCap,
  companies: Building2,
  drives: BriefcaseBusiness,
  applications: FileText,
  interviews: CalendarDays,
  pipeline: Workflow,
  offers: Handshake,
  recruiters: Users,
  activities: Activity,
  eligibility: ClipboardCheck,
  analytics: BarChart3,
  reports: FileText,
  email: Mail,
  announcements: Bell,
  "recruiter-dashboard": Users,
  "recruiter-portal": Users,
  "admin-users": Users,
  admin: ShieldCheck,
  "admin-control-center": LayoutDashboard,
  "admin-audit": Activity,
};

type Role = "ADMIN" | "PLACEMENT_OFFICER" | "STUDENT" | string;
type LinkItem = readonly [string, string, string];

const studentLinks: readonly LinkItem[] = [
  ["Dashboard", "/dashboard", "dashboard"],
  ["Opportunities", "/opportunities", "opportunities"],
  ["My Applications", "/my-applications", "my-applications"],
  ["Interview Hub", "/interview-hub", "interview-hub"],
  ["Offer Center", "/offer-center", "offer-center"],
  ["Notifications", "/notifications", "notifications"],
  ["My Profile", "/profile", "profile"],
];

const staffLinks: readonly LinkItem[] = [
  ["Dashboard", "/dashboard", "dashboard"],
  ["Students", "/students", "students"],
  ["Companies", "/companies", "companies"],
  ["Placement Drives", "/drives", "drives"],
  ["Applications", "/applications", "applications"],
  ["Interviews", "/interviews", "interviews"],
  ["Offers", "/offers", "offers"],
  ["Analytics", "/analytics", "analytics"],
  ["Notifications", "/notifications", "notifications"],
];

const adminLinks: readonly LinkItem[] = [
  ["Admin Control", "/admin", "admin"],
  ["User Management", "/admin/users", "admin-users"],
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
}

export default function SidebarNav({ role, notificationCount = 0 }: { role: Role; notificationCount?: number }) {
  const pathname = usePathname();
  const links = role === "STUDENT" ? studentLinks : staffLinks;

  const renderLink = ([text, href, key]: LinkItem) => {
    const active = isActivePath(pathname, href);
    const Icon = iconMap[key];
    return (
      <Link
        className={`nav-item ${active ? "active" : ""}`}
        href={href}
        key={key}
        aria-current={active ? "page" : undefined}
      >
        <span className="nav-label">
          <span className="nav-icon">{Icon ? <Icon size={15} strokeWidth={1.8} /> : null}</span>
          <span>{text}</span>
        </span>
        {key === "notifications" && notificationCount > 0 && (
          <span className="nav-count" aria-label={`${notificationCount} unread notifications`}>
            {notificationCount > 99 ? "99+" : notificationCount}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      <nav aria-label="Primary navigation">{links.map(renderLink)}</nav>
      {role === "ADMIN" && (
        <>
          <div className="sidebar-section-label sidebar-section-label-secondary">ADMINISTRATION</div>
          <nav aria-label="Administration navigation">{adminLinks.map(renderLink)}</nav>
        </>
      )}
    </>
  );
}
