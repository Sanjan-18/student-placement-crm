"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PlacementStatusControl({ id, current, canManage }: { id: string; current: string; canManage: boolean }) {
  const [status, setStatus] = useState(current);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function update(nextStatus: string) {
    const previous = status;
    setStatus(nextStatus); setLoading(true); setError("");
    try {
      const res = await fetch(`/api/students/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
      if (!res.ok) throw new Error((await res.json()).error || "Could not update status.");
      router.refresh();
    } catch (e) {
      setStatus(previous); setError(e instanceof Error ? e.message : "Could not update status.");
    } finally { setLoading(false); }
  }

  return <div className="status-control"><select disabled={!canManage || loading} value={status} onChange={e => update(e.target.value)} aria-label="Placement status"><option value="NOT_PLACED">Not placed</option><option value="PLACED">Placed</option><option value="OPTED_OUT">Opted out</option></select>{error && <small role="alert">{error}</small>}</div>;
}
