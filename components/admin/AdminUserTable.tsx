"use client";

import { useMemo, useState } from "react";
import { Users, GraduationCap, Briefcase, ShieldCheck, CheckCircle2, AlertCircle, X, Search } from "lucide-react";

type Role = "STUDENT" | "PLACEMENT_OFFICER" | "ADMIN";

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  createdAt: string;
  hasStudentProfile: boolean;
};

const roleLabel: Record<Role, string> = {
  STUDENT: "Student",
  PLACEMENT_OFFICER: "Placement Officer",
  ADMIN: "Administrator",
};

export default function AdminUserTable({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | Role>("ALL");
  const [rows, setRows] = useState(users);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filtered = useMemo(() => {
    const n = query.trim().toLowerCase();
    return rows.filter(
      (u) =>
        (!n || `${u.name ?? ""} ${u.email ?? ""}`.toLowerCase().includes(n)) &&
        (roleFilter === "ALL" || u.role === roleFilter)
    );
  }, [rows, query, roleFilter]);

  const counts = useMemo(
    () =>
      rows.reduce<Record<string, number>>((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
      }, {}),
    [rows]
  );

  async function updateRole(userId: string, role: Role) {
    setMessage(null);
    const old = rows.find((u) => u.id === userId)?.role;
    if (!old || old === role) return;

    if (userId === currentUserId && role !== "ADMIN") {
      setMessage({
        type: "error",
        text: "You cannot remove your own administrator access.",
      });
      return;
    }

    setSavingId(userId);
    try {
      const res = await fetch("/api/admin/users/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Unable to update the role.");

      setRows((current) =>
        current.map((u) => (u.id === userId ? { ...u, role: data.role } : u))
      );
      setMessage({
        type: "success",
        text: `Role updated to ${roleLabel[role]} successfully.`,
      });
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Unable to update the role.",
      });
    } finally {
      setSavingId(null);
    }
  }

  const isFiltering = Boolean(query || roleFilter !== "ALL");

  return (
    <div className="admin-users-module">
      <div className="admin-user-kpis" aria-label="User account summary">
        <KPI
          title="Total Users"
          value={rows.length}
          subtitle="All accounts"
          icon={<Users size={16} />}
        />
        <KPI
          title="Students"
          value={counts.STUDENT || 0}
          subtitle="Candidates"
          icon={<GraduationCap size={16} />}
        />
        <KPI
          title="Officers"
          value={counts.PLACEMENT_OFFICER || 0}
          subtitle="Staff team"
          icon={<Briefcase size={16} />}
        />
        <KPI
          title="Admins"
          value={counts.ADMIN || 0}
          subtitle="Privileged"
          icon={<ShieldCheck size={16} />}
        />
      </div>

      <section className="panel admin-users-panel">
        <div className="section-heading admin-panel-head">
          <div>
            <h2>Users & Access Control</h2>
            <p>Search accounts, review permissions and change roles safely.</p>
          </div>
          <span className="admin-result-count">
            {filtered.length} of {rows.length} users
          </span>
        </div>

        <div className="admin-user-filters">
          <div className="admin-search-field">
            <Search size={16} className="admin-search-icon" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email…"
              aria-label="Search users by name or email"
            />
            {query && (
              <button
                type="button"
                className="admin-field-clear"
                onClick={() => setQuery("")}
                aria-label="Clear search input"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="admin-filter-actions">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as "ALL" | Role)}
              aria-label="Filter users by role"
              className="admin-role-filter-select"
            >
              <option value="ALL">All Roles ({rows.length})</option>
              <option value="STUDENT">Students ({counts.STUDENT || 0})</option>
              <option value="PLACEMENT_OFFICER">Placement Officers ({counts.PLACEMENT_OFFICER || 0})</option>
              <option value="ADMIN">Administrators ({counts.ADMIN || 0})</option>
            </select>

            {isFiltering && (
              <button
                type="button"
                className="secondary admin-clear-all"
                onClick={() => {
                  setQuery("");
                  setRoleFilter("ALL");
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className={`action-feedback ${message.type}`} role="status">
            <span className="feedback-icon" aria-hidden="true">
              {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            </span>
            <span className="feedback-text">{message.text}</span>
            <button
              type="button"
              className="feedback-dismiss"
              onClick={() => setMessage(null)}
              aria-label="Dismiss feedback message"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="admin-user-empty">
            <div className="admin-empty-icon">⌕</div>
            <strong>No users match these filters</strong>
            <span>Try searching with a different keyword or resetting role filters.</span>
            {isFiltering && (
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setQuery("");
                  setRoleFilter("ALL");
                }}
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= 769px) */}
            <div className="admin-user-desktop-table">
              <div className="admin-user-table-wrap">
                <div className="admin-user-table admin-user-table-head">
                  <span>User</span>
                  <span>Role</span>
                  <span>Profile</span>
                  <span>Joined</span>
                  <span>Access</span>
                </div>
                {filtered.map((u) => {
                  const self = u.id === currentUserId;
                  const isSaving = savingId === u.id;
                  return (
                    <div className="admin-user-table admin-user-table-row" key={u.id}>
                      <div className="admin-user-identity">
                        <span className="admin-user-avatar">
                          {(u.name || u.email || "U").slice(0, 1).toUpperCase()}
                        </span>
                        <div>
                          <strong>{u.name || "Unnamed user"}</strong>
                          <small>{u.email || "No email"}</small>
                        </div>
                      </div>
                      <div>
                        <span className={`admin-role-badge ${u.role.toLowerCase()}`}>
                          {roleLabel[u.role]}
                        </span>
                      </div>
                      <div>
                        <span className={u.hasStudentProfile ? "profile-present" : "profile-missing"}>
                          {u.hasStudentProfile ? "Student profile" : "Not applicable"}
                        </span>
                      </div>
                      <span className="admin-date">
                        {new Date(u.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <div className="admin-role-action">
                        <select
                          aria-label={`Role for ${u.name || u.email || "user"}`}
                          value={u.role}
                          disabled={isSaving || self}
                          onChange={(e) => updateRole(u.id, e.target.value as Role)}
                        >
                          <option value="STUDENT">Student</option>
                          <option value="PLACEMENT_OFFICER">Placement Officer</option>
                          <option value="ADMIN">Administrator</option>
                        </select>
                        {self && <small className="admin-self-note">Current account</small>}
                        {isSaving && <small className="admin-saving-note">Saving role…</small>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Cards View (<= 768px) */}
            <div className="admin-user-mobile-cards" aria-label="User list">
              {filtered.map((u) => {
                const self = u.id === currentUserId;
                const isSaving = savingId === u.id;
                return (
                  <article className="admin-user-card" key={`mobile-${u.id}`}>
                    <div className="admin-user-card-head">
                      <div className="admin-user-card-user">
                        <span className="admin-user-avatar">
                          {(u.name || u.email || "U").slice(0, 1).toUpperCase()}
                        </span>
                        <div>
                          <strong>{u.name || "Unnamed user"}</strong>
                          <small>{u.email || "No email"}</small>
                        </div>
                      </div>
                      <span className={`admin-role-badge ${u.role.toLowerCase()}`}>
                        {roleLabel[u.role]}
                      </span>
                    </div>

                    <div className="admin-user-card-meta">
                      <div className="admin-user-card-meta-item">
                        <span>Profile Status</span>
                        <strong className={u.hasStudentProfile ? "profile-present" : "profile-missing"}>
                          {u.hasStudentProfile ? "✓ Student record" : "No student record"}
                        </strong>
                      </div>
                      <div className="admin-user-card-meta-item">
                        <span>Joined Date</span>
                        <strong>
                          {new Date(u.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </strong>
                      </div>
                    </div>

                    <div className="admin-user-card-action">
                      <div className="admin-card-action-label-row">
                        <label htmlFor={`mobile-role-${u.id}`}>Role & Access</label>
                        {self && <span className="admin-self-badge">Protected (Your Account)</span>}
                        {isSaving && <span className="admin-saving-badge">Updating…</span>}
                      </div>
                      <select
                        id={`mobile-role-${u.id}`}
                        aria-label={`Role for ${u.name || u.email || "user"}`}
                        value={u.role}
                        disabled={isSaving || self}
                        onChange={(e) => updateRole(u.id, e.target.value as Role)}
                        className="admin-card-role-select"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="PLACEMENT_OFFICER">Placement Officer</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function KPI({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="panel admin-user-kpi">
      <div className="admin-kpi-head">
        <span>{title}</span>
        <div className="admin-kpi-icon" aria-hidden="true">{icon}</div>
      </div>
      <strong>{value}</strong>
      <small>{subtitle}</small>
    </div>
  );
}

