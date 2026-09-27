"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";

const studentItems = [
  ["Dashboard", "/dashboard"],
  ["Opportunities", "/opportunities"],
  ["My Applications", "/my-applications"],
  ["Interview Hub", "/interview-hub"],
  ["Offer Center", "/offer-center"],
  ["Notifications", "/notifications"],
  ["My Profile", "/profile"],
] as const;

const staffItems = [
  ["Dashboard", "/dashboard"],
  ["Students", "/students"],
  ["Companies", "/companies"],
  ["Placement Drives", "/drives"],
  ["Applications", "/applications"],
  ["Interviews", "/interviews"],
  ["Offers", "/offers"],
  ["Analytics", "/analytics"],
  ["Notifications", "/notifications"],
] as const;

const adminItems = [
  ["Admin Control", "/admin"],
  ["User Management", "/admin/users"],
] as const;

export default function MobileNav({ role = "STUDENT", notificationCount = 0 }: { role?: "ADMIN" | "PLACEMENT_OFFICER" | "STUDENT" | string; notificationCount?: number }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isStudent = role === "STUDENT";
  const [loggingOut, setLoggingOut] = useState(false);
  const items = isStudent ? studentItems : staffItems;
  const label = isStudent ? "Student workspace" : "Placement operations";
  const isActive = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const menuButton = menuButtonRef.current;
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      menuButton?.focus();
    };
  }, [open]);

  return (
    <>
      <button ref={menuButtonRef} className="mobile-menu-btn" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}><Menu size={20} /></button>
      {open && (
        <div className="mobile-overlay" onClick={() => setOpen(false)}>
          <aside className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Workspace navigation" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-head">
              <div><div className="mobile-brand"><span className="mobile-brand-mark">P</span><span>PlacementCRM</span></div><small className="mobile-role-label">{label}</small></div>
              <button ref={closeButtonRef} onClick={() => setOpen(false)} aria-label="Close navigation"><X size={20} /></button>
            </div>
            <nav className="mobile-nav-list" aria-label="Primary navigation">
              {items.map(([text, href]) => <Link className={isActive(href) ? "active" : ""} aria-current={isActive(href) ? "page" : undefined} href={href} onClick={() => setOpen(false)} key={href}><span>{text}</span>{href === "/notifications" && notificationCount > 0 && <span className="mobile-nav-count" aria-label={`${notificationCount} unread notifications`}>{notificationCount > 99 ? "99+" : notificationCount}</span>}</Link>)}
              {role === "ADMIN" && <><div className="mobile-nav-section">ADMINISTRATION</div>{adminItems.map(([text, href]) => <Link className={isActive(href) ? "active" : ""} aria-current={isActive(href) ? "page" : undefined} href={href} onClick={() => setOpen(false)} key={href}><span>{text}</span></Link>)}</>}
            </nav>
            <button
              type="button"
              className="mobile-logout"
              disabled={loggingOut}
              onClick={async () => {
                setLoggingOut(true);
                await signOut({ callbackUrl: "/login" });
              }}
            >
              <LogOut size={16} />
              <span>{loggingOut ? "Logging out…" : "Logout"}</span>
            </button>
          </aside>
        </div>
      )}
    </>
  );
}
