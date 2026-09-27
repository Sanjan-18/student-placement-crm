"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, MapPin, Search, Timer } from "lucide-react";
import SavedDriveButton from "@/components/saved/SavedDriveButton";

type Opportunity = {
  id: string;
  company: string;
  role: string;
  location: string;
  packageLpa: number | null;
  deadline: string | null;
  driveDate: string | null;
  eligible: boolean;
  reasons: string[];
  applied: boolean;
  applicationStatus: string | null;
  savedId: string | null;
  departments: string;
};

function label(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

export default function OpportunityFilters({ opportunities }: { opportunities: Opportunity[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ELIGIBLE" | "NOT_APPLIED">("ALL");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return opportunities.filter(item => {
      const matchesQuery = !q || [item.company, item.role, item.location, item.departments].some(v => v.toLowerCase().includes(q));
      const matchesFilter = filter === "ALL" || (filter === "ELIGIBLE" && item.eligible) || (filter === "NOT_APPLIED" && !item.applied);
      return matchesQuery && matchesFilter;
    });
  }, [filter, opportunities, query]);

  return (
    <>
      <div className="opportunity-toolbar panel">
        <div className="search-box"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search company, role or location..." /></div>
        <div className="opportunity-filters">
          <button className={filter === "ALL" ? "filter-active" : ""} onClick={() => setFilter("ALL")}>All</button>
          <button className={filter === "ELIGIBLE" ? "filter-active" : ""} onClick={() => setFilter("ELIGIBLE")}>Eligible</button>
          <button className={filter === "NOT_APPLIED" ? "filter-active" : ""} onClick={() => setFilter("NOT_APPLIED")}>Not applied</button>
        </div>
      </div>

      <div className="opportunity-grid">
        {!visible.length ? <div className="panel opportunity-empty"><BriefcaseBusiness size={24}/><h3>No matching opportunities</h3><p>Try a different search or filter.</p></div> : visible.map(item => (
          <article className="panel opportunity-card" key={item.id}>
            <div className="opportunity-card-head"><div className="company-avatar">{item.company.charAt(0).toUpperCase()}</div><div><h3>{item.role}</h3><p>{item.company}</p></div><span className={item.eligible ? "eligibility-pill eligible" : "eligibility-pill"}>{item.eligible ? "Eligible" : "Not eligible"}</span></div>
            <div className="opportunity-meta"><span><MapPin size={14}/>{item.location || "Location not specified"}</span><span><Timer size={14}/>{item.deadline ? `Deadline ${new Date(item.deadline).toLocaleDateString("en-IN", {day:"2-digit", month:"short"})}` : "No deadline"}</span></div>
            <div className="opportunity-package">{item.packageLpa ? <><strong>₹{item.packageLpa} LPA</strong><small>Package</small></> : <><strong>Not specified</strong><small>Package</small></>}</div>
            {item.applied && <div className="opportunity-applied">Applied · {item.applicationStatus ? label(item.applicationStatus) : "In progress"}</div>}
            {!item.eligible && item.reasons.length > 0 && <p className="opportunity-reason">{item.reasons[0]}</p>}
            <div className="opportunity-actions"><SavedDriveButton driveId={item.id} initialSavedId={item.savedId}/><Link className="secondary" href={`/drives/${item.id}`}>View details <ArrowUpRight size={14}/></Link>{item.eligible && !item.applied && <Link className="primary" href={`/drives/${item.id}`}>Apply</Link>}</div>
          </article>
        ))}
      </div>
      <p className="opportunity-result-count">Showing {visible.length} of {opportunities.length} active opportunities</p>
    </>
  );
}
