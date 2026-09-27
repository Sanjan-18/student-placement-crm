"use client";

import { useState } from "react";
import Link from "next/link";

export default function ProfileEditor({ initial }: { initial: any }) {
  const [form, setForm] = useState({
    name: initial.user?.name || initial.name || "",
    phone: initial.phone || "", usn: initial.usn || "", department: initial.department || "",
    graduationYear: initial.graduationYear || "", cgpa: initial.cgpa ?? "", tenthPercentage: initial.tenthPercentage ?? "",
    twelfthPercentage: initial.twelfthPercentage ?? "", backlogs: initial.backlogs ?? 0, resumeUrl: initial.resumeUrl || ""
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const set = (key: string, value: string) => setForm(current => ({ ...current, [key]: value }));
  const requiredDone = [form.phone, form.usn, form.department, form.graduationYear, form.cgpa, form.tenthPercentage, form.twelfthPercentage, form.resumeUrl].filter(Boolean).length;

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMessage(""); setError(false);
    try {
      const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      setSaving(false);
      if (!res.ok) { setError(true); setMessage(data.error || "Update failed."); return; }
      setMessage("Profile updated successfully.");
    } catch { setSaving(false); setError(true); setMessage("Something went wrong. Check your connection and try again."); }
  }

  return <form className="form-card polished-form profile-editor-card" onSubmit={submit} noValidate>
    <div className="form-card-heading"><div><p className="eyebrow">PROFILE SETTINGS</p><h2>Keep your placement profile current</h2><p>Accurate academic details help the CRM evaluate drive eligibility correctly.</p></div><span className="profile-edit-progress">{requiredDone}/8 complete</span></div>
    <div className="profile-form-section"><h3>Contact & identity</h3><div className="form-grid">
      <label>Full name<input required value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your full name" autoComplete="name" /></label>
      <label>Phone<input required type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g,""))} placeholder="10-digit phone" autoComplete="tel" /></label>
      <label>USN<input required value={form.usn} onChange={e => set("usn", e.target.value.toUpperCase())} placeholder="University seat number" /></label>
      <label>Department<input required value={form.department} onChange={e => set("department", e.target.value)} placeholder="CSE" /></label>
    </div></div>
    <div className="profile-form-section"><h3>Academic details</h3><div className="form-grid">
      <label>Graduation Year<input required type="number" min="2000" max="2100" value={form.graduationYear} onChange={e => set("graduationYear", e.target.value)} /></label>
      <label>CGPA<input required type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={e => set("cgpa", e.target.value)} /></label>
      <label>10th Percentage<input required type="number" step="0.01" min="0" max="100" value={form.tenthPercentage} onChange={e => set("tenthPercentage", e.target.value)} /></label>
      <label>12th Percentage<input required type="number" step="0.01" min="0" max="100" value={form.twelfthPercentage} onChange={e => set("twelfthPercentage", e.target.value)} /></label>
      <label>Backlogs<input type="number" min="0" step="1" value={form.backlogs} onChange={e => set("backlogs", e.target.value)} /></label>
    </div></div>
    <div className="profile-form-section"><h3>Resume</h3><div className="form-grid"><label className="full-label">Resume URL<input required type="url" value={form.resumeUrl} onChange={e => set("resumeUrl", e.target.value)} placeholder="https://.../resume.pdf" /><small className="field-help">Use a recruiter-accessible HTTPS link to your current resume.</small></label></div></div>
    <div className="form-actions"><button className="primary form-submit" disabled={saving}>{saving ? <><span className="button-spinner" aria-hidden="true" /> Saving profile...</> : "Save Profile"}</button><Link className="secondary" href="/profile">Cancel</Link>{message && <span className={`form-message ${error ? "form-message-error" : "form-message-success"}`} role="status">{message}</span>}</div>
  </form>;
}
