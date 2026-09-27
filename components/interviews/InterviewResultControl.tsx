"use client";
import { useState } from "react";

const results = ["PENDING", "PASS", "FAIL", "CANCELLED", "RESCHEDULED"];

export default function InterviewResultControl({ id, current }: { id: string; current: string }) {
  const [value, setValue] = useState(current || "PENDING");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(next: string) {
    const previous = value;
    setValue(next); setSaving(true); setError("");
    try {
      const res = await fetch(`/api/interviews/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ result: next }) });
      if (!res.ok) throw new Error((await res.json()).error || "Unable to update result");
    } catch (e) {
      setValue(previous); setError(e instanceof Error ? e.message : "Unable to update result");
    } finally { setSaving(false); }
  }

  return <div className="result-control-wrap"><label className="inline-control">Result<select value={value} disabled={saving} onChange={(e) => save(e.target.value)}>{results.map((x) => <option key={x}>{x}</option>)}</select></label>{saving && <span className="saving-note">Saving…</span>}{error && <span className="form-error">{error}</span>}</div>;
}
