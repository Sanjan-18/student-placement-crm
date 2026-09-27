"use client";
import { useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
export default function OfferResponseControl({ offerId }: { offerId: string }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const respond = async (status: "ACCEPTED" | "DECLINED") => {
    if (!window.confirm(status === "ACCEPTED" ? "Accept this placement offer?" : "Decline this placement offer?")) return;
    setBusy(true); setError("");
    const res = await fetch(`/api/offers/${offerId}/respond`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setError(data.error || "Could not update the offer."); setBusy(false); return; }
    window.location.reload();
  };
  return <div className="offer-response-control"><button className="primary" disabled={busy} onClick={() => respond("ACCEPTED")}>{busy ? <Loader2 className="spin" size={15}/> : <CheckCircle2 size={15}/>} Accept offer</button><button className="secondary danger-outline" disabled={busy} onClick={() => respond("DECLINED")}>{busy ? <Loader2 className="spin" size={15}/> : <XCircle size={15}/>} Decline</button>{error && <small className="form-error">{error}</small>}</div>;
}
