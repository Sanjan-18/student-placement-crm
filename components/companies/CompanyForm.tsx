"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Company = { id?: string; name?: string | null; industry?: string | null; website?: string | null; location?: string | null; recruiter?: string | null; recruiterEmail?: string | null; description?: string | null };

export default function CompanyForm({ company }: { company?: Company }) {
  const router = useRouter();
  const editing = Boolean(company?.id);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function submit(fd: FormData) {
    setLoading(true); setMessage(""); setError(false);
    const body = Object.fromEntries(fd.entries());
    const name = String(body.name || "").trim();
    const website = String(body.website || "").trim();
    const recruiterEmail = String(body.recruiterEmail || "").trim();
    if (!name) { setError(true); setMessage("Company name is required."); setLoading(false); return; }
    if (name.length > 120) { setError(true); setMessage("Company name must be 120 characters or less."); setLoading(false); return; }
    if (recruiterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recruiterEmail)) { setError(true); setMessage("Enter a valid recruiter email."); setLoading(false); return; }
    if (website) { try { new URL(website); } catch { setError(true); setMessage("Enter a valid website URL, including https://."); setLoading(false); return; } }
    try {
      const res = await fetch(editing ? `/api/companies/${company!.id}` : "/api/companies", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(true); setMessage(data.error || "Could not save company."); setLoading(false); return; }
      router.push(`/companies/${data.id}`); router.refresh();
    } catch { setError(true); setMessage("Something went wrong. Check your connection and try again."); setLoading(false); }
  }

  return <form className="form-card polished-form company-editor" action={submit} noValidate>
    <div className="form-card-heading"><div><p className="eyebrow">COMPANY RECORD</p><h2>{editing ? "Edit company" : "Add company"}</h2><p>{editing ? "Keep company and recruiter information accurate for active placement work." : "Keep company and recruiter information ready for placement drives."}</p></div><span className="required-note"><b>*</b> Required</span></div>
    <div className="company-form-section"><h3>Company information</h3><div className="form-grid">
      <label>Company Name <span className="required-mark">*</span><input name="name" required defaultValue={company?.name || ""} placeholder="ABC Technologies" autoComplete="organization" /></label>
      <label>Industry<input name="industry" defaultValue={company?.industry || ""} placeholder="Information Technology" /></label>
      <label>Website<input name="website" type="url" inputMode="url" defaultValue={company?.website || ""} placeholder="https://example.com" /></label>
      <label>Location<input name="location" defaultValue={company?.location || ""} placeholder="Bangalore" /></label>
    </div></div>
    <div className="company-form-section"><h3>Primary recruiter</h3><div className="form-grid">
      <label>Recruiter Name<input name="recruiter" defaultValue={company?.recruiter || ""} placeholder="Recruiter name" autoComplete="name" /></label>
      <label>Recruiter Email<input name="recruiterEmail" type="email" inputMode="email" defaultValue={company?.recruiterEmail || ""} placeholder="recruiter@company.com" autoComplete="email" /></label>
    </div></div>
    <label className="full-label">Description<textarea name="description" rows={5} defaultValue={company?.description || ""} placeholder="Company overview and hiring information" /></label>
    {message && <div className={`form-alert ${error ? "form-alert-error" : "form-alert-success"}`} role="alert">{message}</div>}
    <div className="form-actions"><button className="primary form-submit" disabled={loading}>{loading ? <><span className="button-spinner" aria-hidden="true" /> Saving company...</> : editing ? "Save changes" : "Create Company"}</button></div>
  </form>;
}
