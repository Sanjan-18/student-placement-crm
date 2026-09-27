"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Drive = { id?: string; companyId?: string; role?: string | null; description?: string | null; location?: string | null; packageLpa?: number | null; driveDate?: Date | string | null; applicationDeadline?: Date | string | null; minCgpa?: number | null; allowedDepartments?: string | null; graduationYear?: number | null; maxBacklogs?: number | null };

const localDate = (value?: Date | string | null) => { if (!value) return ""; const d = new Date(value); const pad = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };

export default function DriveForm({ companies, drive }: { companies: { id: string; name: string }[]; drive?: Drive }) {
  const editing = Boolean(drive?.id); const [loading, setLoading] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState(false); const router = useRouter();
  async function submit(fd: FormData) {
    setLoading(true); setMessage(""); setError(false); const body = Object.fromEntries(fd.entries());
    const role = String(body.role || "").trim(); const companyId = String(body.companyId || "");
    const driveDate = String(body.driveDate || ""); const deadline = String(body.applicationDeadline || "");
    const packageLpa = String(body.packageLpa || ""); const minCgpa = String(body.minCgpa || ""); const maxBacklogs = String(body.maxBacklogs || "");
    if (!companyId || !role) { setError(true); setMessage("Company and job role are required."); setLoading(false); return; }
    if (packageLpa && Number(packageLpa) < 0) { setError(true); setMessage("Package cannot be negative."); setLoading(false); return; }
    if (minCgpa && (Number(minCgpa) < 0 || Number(minCgpa) > 10)) { setError(true); setMessage("Minimum CGPA must be between 0 and 10."); setLoading(false); return; }
    if (maxBacklogs && Number(maxBacklogs) < 0) { setError(true); setMessage("Maximum backlogs cannot be negative."); setLoading(false); return; }
    if (driveDate && deadline && new Date(deadline) < new Date(driveDate)) { setError(true); setMessage("Application deadline cannot be before the drive date."); setLoading(false); return; }
    try { const res = await fetch(editing ? `/api/drives/${drive!.id}` : "/api/drives", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const data = await res.json(); if (!res.ok) { setError(true); setMessage(data.error || `Could not ${editing ? "update" : "create"} drive.`); setLoading(false); return; } router.push(`/drives/${data.id}`); router.refresh(); } catch { setError(true); setMessage("Something went wrong. Check your connection and try again."); setLoading(false); }
  }
  return <form className="form-card polished-form drive-editor" action={submit} noValidate>
    <div className="form-card-heading"><div><p className="eyebrow">PLACEMENT DRIVE</p><h2>{editing ? "Edit drive" : "Create drive"}</h2><p>{editing ? "Keep the role, timeline and eligibility rules accurate for students and placement staff." : "Define the role, timeline and eligibility criteria for the hiring process."}</p></div><span className="required-note"><b>*</b> Required</span></div>
    <div className="drive-form-section"><h3>Hiring details</h3><div className="form-grid"><label>Company <span className="required-mark">*</span><select name="companyId" required defaultValue={drive?.companyId || ""}><option value="" disabled>Select company</option>{companies.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select></label><label>Job Role <span className="required-mark">*</span><input name="role" required defaultValue={drive?.role || ""} placeholder="Software Engineer" /></label><label>Package (LPA)<input name="packageLpa" type="number" min="0" step="0.01" defaultValue={drive?.packageLpa ?? ""} placeholder="8.50" /></label><label>Location<input name="location" defaultValue={drive?.location || ""} placeholder="Bangalore / Remote" /></label></div></div>
    <div className="drive-form-section"><h3>Timeline</h3><div className="form-grid"><label>Drive Date<input name="driveDate" type="datetime-local" defaultValue={localDate(drive?.driveDate)} /></label><label>Application Deadline<input name="applicationDeadline" type="datetime-local" defaultValue={localDate(drive?.applicationDeadline)} /></label></div></div>
    <div className="drive-form-section"><h3>Eligibility</h3><div className="form-grid"><label>Minimum CGPA<input name="minCgpa" type="number" min="0" max="10" step="0.01" defaultValue={drive?.minCgpa ?? 0} /></label><label>Graduation Year<input name="graduationYear" type="number" min="2000" max="2100" defaultValue={drive?.graduationYear ?? ""} placeholder="2027" /></label><label>Maximum Backlogs<input name="maxBacklogs" type="number" min="0" step="1" defaultValue={drive?.maxBacklogs ?? 0} /></label><label>Allowed Departments<input name="allowedDepartments" defaultValue={drive?.allowedDepartments || ""} placeholder="CSE, ISE, ECE" /></label></div></div>
    <label className="full-label">Job Description<textarea name="description" rows={6} defaultValue={drive?.description || ""} placeholder="Responsibilities, skills and selection process" /></label>
    {message && <div className={`form-alert ${error ? "form-alert-error" : "form-alert-success"}`} role="alert">{message}</div>}<div className="form-actions"><button className="primary form-submit" disabled={loading}>{loading ? <><span className="button-spinner" aria-hidden="true" /> {editing ? "Saving changes..." : "Creating drive..."}</> : editing ? "Save changes" : "Create Placement Drive"}</button></div>
  </form>;
}
