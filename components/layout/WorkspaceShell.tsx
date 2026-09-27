import type { ReactNode } from "react";
import MobileNav from "@/components/layout/MobileNav";
import SidebarNav from "@/components/layout/SidebarNav";
import LogoutButton from "@/components/layout/LogoutButton";

 type Role = "ADMIN" | "PLACEMENT_OFFICER" | "STUDENT" | string;

type Props = {
  children: ReactNode;
  role: Role;
  active?: string;
  notificationCount?: number;
  global?: boolean;
};

export default function WorkspaceShell({ children, role, notificationCount = 0, global = false }: Props) {
  const safeRole = role || "STUDENT";
  const isStudent = safeRole === "STUDENT";
  const label = isStudent ? "STUDENT WORKSPACE" : "PLACEMENT OPERATIONS";

  return (
    <main className="dashboard">
      <a className="skip-link" href="#workspace-content">Skip to content</a>
      <aside className="sidebar">
        <div className="brand">
          <div className="logo small">P</div>
          <div><b>PlacementCRM</b><small>{isStudent ? "Student workspace" : "Placement workspace"}</small></div>
        </div>
        <div className="sidebar-section-label">{label}</div>
        <SidebarNav role={safeRole} notificationCount={notificationCount} />
        <div className="sidebar-bottom">
          <div className="sidebar-account-mark">{safeRole === "STUDENT" ? "S" : safeRole === "ADMIN" ? "A" : "P"}</div>
          <div className="sidebar-account-copy">
            <span className="role-pill">{safeRole.replaceAll("_", " ")}</span>
            <small>Google authentication enabled</small>
          </div>
          <LogoutButton />
        </div>
      </aside>
      <section className="content" id="workspace-content" tabIndex={-1}>
        <MobileNav role={safeRole} notificationCount={notificationCount} />
        {children}
      </section>
    </main>
  );
}
