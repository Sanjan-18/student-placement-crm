"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type StudentValues = {
  id?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  usn?: string | null;
  department?: string | null;
  graduationYear?: number | null;
  cgpa?: number | null;
  tenthPercentage?: number | null;
  twelfthPercentage?: number | null;
  backlogs?: number | null;
  resumeUrl?: string | null;
  placementStatus?: string | null;
};

export default function StudentForm({ initial }: { initial?: StudentValues }) {
  const router = useRouter();
  const editing = Boolean(initial?.id);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true); setMessage(""); setError(false);
    const payload = Object.fromEntries(formData.entries());
    try {
      const res = await fetch(editing ? `/api/students/${initial!.id}` : "/api/students", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(true); setMessage(data.error || "Could not save student."); setLoading(false); return; }
      router.push(`/students/${data.id}`); router.refresh();
    } catch {
      setError(true); setMessage("Something went wrong. Check your connection and try again."); setLoading(false);
    }
  }

  const value = (key: keyof StudentValues) => initial?.[key] ?? "";

  return (
    <form className="form-card polished-form student-form" action={submit} noValidate>
      <div className="form-card-heading"><div><p className="eyebrow">STUDENT RECORD</p><h2>{editing ? "Edit student" : "Create student"}</h2><p>{editing ? "Keep academic and placement information accurate and up to date." : "Add the student's academic and placement information."}</p></div><span className="required-note"><b>*</b> Required</span></div>
      <div className="student-form-section"><h3>Identity & contact</h3><div className="form-grid">
        <label>Name <span className="required-mark">*</span><input name="name" defaultValue={value("name") as string} placeholder="Student name" required autoComplete="name" /></label>
        <label>Email <span className="required-mark">*</span><input name="email" type="email" defaultValue={value("email") as string} placeholder="student@example.com" required autoComplete="email" /></label>
        <label>Phone<input name="phone" type="tel" defaultValue={value("phone") as string} placeholder="+91 98765 43210" autoComplete="tel" /></label>
        <label>USN<input name="usn" defaultValue={value("usn") as string} placeholder="1XXXX0000" autoCapitalize="characters" /></label>
        <label>Department<input name="department" defaultValue={value("department") as string} placeholder="Computer Science" /></label>
        <label>Graduation Year<input name="graduationYear" type="number" min="2000" max="2100" defaultValue={value("graduationYear") as number | ""} placeholder="2027" /></label>
      </div></div>
      <div className="student-form-section"><h3>Academic profile</h3><div className="form-grid">
        <label>CGPA<input name="cgpa" type="number" min="0" max="10" step="0.01" defaultValue={value("cgpa") as number | ""} placeholder="8.50" /></label>
        <label>10th Percentage<input name="tenthPercentage" type="number" min="0" max="100" step="0.01" defaultValue={value("tenthPercentage") as number | ""} placeholder="90" /></label>
        <label>12th Percentage<input name="twelfthPercentage" type="number" min="0" max="100" step="0.01" defaultValue={value("twelfthPercentage") as number | ""} placeholder="90" /></label>
        <label>Backlogs<input name="backlogs" type="number" min="0" step="1" defaultValue={value("backlogs") as number || 0} /></label>
      </div></div>
      <div className="student-form-section"><h3>Placement information</h3><div className="form-grid">
        <label className="full-label">Resume URL<input name="resumeUrl" type="url" defaultValue={value("resumeUrl") as string} placeholder="https://..." /></label>
        <label>Placement Status<select name="placementStatus" defaultValue={(value("placementStatus") as string) || "NOT_PLACED"}><option value="NOT_PLACED">Not placed</option><option value="PLACED">Placed</option><option value="OPTED_OUT">Opted out</option></select></label>
      </div></div>
      {message && <div className={`form-alert ${error ? "form-alert-error" : "form-alert-success"}`} role="alert">{message}</div>}
      <div className="form-actions"><button className="primary form-submit" disabled={loading}>{loading ? <><span className="button-spinner" aria-hidden="true" /> Saving...</> : editing ? "Save changes" : "Create Student"}</button><button type="button" className="secondary" disabled={loading} onClick={() => router.back()}>Cancel</button></div>
    </form>
  );
}
