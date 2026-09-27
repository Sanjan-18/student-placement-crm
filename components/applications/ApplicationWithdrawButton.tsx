"use client";
import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
export default function ApplicationWithdrawButton({applicationId,disabled=false}:{applicationId:string;disabled?:boolean}){
 const router=useRouter(); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
 async function withdraw(){ if(busy||disabled)return; if(!window.confirm("Withdraw this application? Pending interviews will be cancelled."))return; setBusy(true);setError(""); try{const res=await fetch(`/api/applications/${applicationId}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"WITHDRAWN"})});const data=await res.json().catch(()=>null);if(!res.ok)throw new Error(data?.error||"Could not withdraw application");router.refresh()}catch(e){setError(e instanceof Error?e.message:"Could not withdraw application")}finally{setBusy(false)}}
 return <div className="application-withdraw-wrap"><button type="button" className="secondary danger-outline" onClick={withdraw} disabled={busy||disabled}>{busy?<Loader2 size={15} className="spin"/>:<AlertTriangle size={15}/>} {busy?"Withdrawing…":"Withdraw application"}</button>{error&&<span className="form-error">{error}</span>}</div>;
}
