"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";

export default function BulkToolbar(){
 const [status,setStatus]=useState("APPLIED");const [loading,setLoading]=useState(false);const router=useRouter();
 async function submit(){
  const ids=Array.from(document.querySelectorAll<HTMLInputElement>('input[name="ids"]:checked')).map(x=>x.value);
  if(!ids.length)return;
  setLoading(true);const res=await fetch("/api/applications/bulk",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({ids,status})});
  setLoading(false);if(res.ok)router.refresh();
 }
 return <div className="bulk-toolbar"><select value={status} onChange={e=>setStatus(e.target.value)}><option>APPLIED</option><option>SHORTLISTED</option><option>APTITUDE</option><option>TECHNICAL</option><option>HR</option><option>SELECTED</option><option>OFFERED</option></select><button className="primary" disabled={loading} onClick={submit}>{loading?"Updating...":"Update Selected"}</button></div>
}
