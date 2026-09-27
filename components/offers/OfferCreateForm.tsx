"use client";

import { useMemo, useState } from "react";

export type OfferCandidate = {
  id: string;
  studentName: string;
  usn: string | null;
  email: string;
  company: string;
  role: string;
  packageLpa: number | null;
  location: string | null;
};

export default function OfferCreateForm({
  candidates,
  action,
}: {
  candidates: OfferCandidate[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState("");
  const selected = useMemo(
    () => candidates.find((candidate) => candidate.id === selectedId) ?? null,
    [candidates, selectedId],
  );

  return (
    <form action={action} className="form-card">
      <div className="form-section-heading">
        <h2>Select offered candidate</h2>
        <p>Only applications already moved to OFFERED are available here.</p>
      </div>

      <label>
        Candidate
        <select
          name="applicationId"
          required
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
        >
          <option value="">Select candidate</option>
          {candidates.map((candidate) => (
            <option value={candidate.id} key={candidate.id}>
              {candidate.studentName} {candidate.usn ? `(${candidate.usn})` : ""} — {candidate.company} · {candidate.role}
            </option>
          ))}
        </select>
      </label>

      {!candidates.length && (
        <div className="form-message form-message-error" role="status">
          No applications are currently at the OFFERED stage without an existing offer.
        </div>
      )}

      <div className="form-grid">
        <label>
          Company
          <input value={selected?.company ?? ""} readOnly placeholder="Auto-filled from application" />
        </label>
        <label>
          Job Role
          <input value={selected?.role ?? ""} readOnly placeholder="Auto-filled from placement drive" />
        </label>
        <label>
          Package (LPA)
          <input
            name="packageLpa"
            type="number"
            step="0.01"
            min="0"
            value={selected?.packageLpa ?? ""}
            readOnly
            placeholder="Auto-filled from placement drive"
          />
        </label>
        <label>
          Location
          <input value={selected?.location ?? "Not specified"} readOnly />
        </label>
      </div>

      <div className="form-grid">
        <label>
          Joining Date
          <input name="joiningDate" type="date" />
        </label>
        <label>
          Initial Status
          <input value="OFFERED" readOnly />
          <input type="hidden" name="status" value="OFFERED" />
        </label>
      </div>

      {selected && (
        <div className="panel offer-create-summary">
          <strong>Offer summary</strong>
          <span>
            {selected.studentName} will receive an offer for {selected.role} at {selected.company}
            {selected.packageLpa != null ? ` · ₹${selected.packageLpa} LPA` : " · Package not specified"}.
          </span>
        </div>
      )}

      <button className="primary" type="submit" disabled={!selected}>
        Create Offer
      </button>
    </form>
  );
}
