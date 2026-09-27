"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplyButton({driveId}:{driveId:string}) {
  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState(false);
  const router=useRouter();
  async function apply(){
    setLoading(true); setMessage(""); setError(false);
    const res=await fetch(`/api/drives/${driveId}/apply`,{method:"POST"});
    const data=await res.json();
    setMessage(data.message || data.error || "Unable to apply.");
    setError(!res.ok); setLoading(false);
    if(res.ok) router.refresh();
  }
  return <div>
    {message && <div className={error ? "error" : "success"}>{message}</div>}
    <button className="primary" disabled={loading} onClick={apply}>
      {loading ? "Applying..." : "Apply Now"}
    </button>
  </div>;
}
