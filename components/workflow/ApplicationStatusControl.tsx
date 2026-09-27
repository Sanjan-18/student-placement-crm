"use client";
import {useState} from "react";
import ActionFeedback from "@/components/ui/ActionFeedback";
import {useRouter} from "next/navigation";

const statuses=["APPLIED","SHORTLISTED","APTITUDE","TECHNICAL","HR","SELECTED","OFFERED"];

export default function ApplicationStatusControl({id,current,canManage=true}:{id:string;current:string;canManage?:boolean}){
 const [status,setStatus]=useState(current);const [loading,setLoading]=useState(false);const [error,setError]=useState(false);const router=useRouter();
 if(!canManage)return null;
 if(["ACCEPTED","REJECTED"].includes(current))return <span className="action-control-note" role="status">Locked — final student decision</span>;
 async function update(v:string){
  setStatus(v);setLoading(true);setError(false);
  const res=await fetch(`/api/applications/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:v})});
  if(!res.ok){setStatus(current);setError(true);}else router.refresh();
  setLoading(false);
 }
 return <div className="inline-action-control"><select value={status} disabled={loading} aria-label="Application status" onChange={e=>update(e.target.value)}>{statuses.map(x=><option key={x}>{x}</option>)}</select>{loading && <span className="action-control-note" role="status">Updating…</span>}{error && <ActionFeedback status="error" message="Update failed" />}</div>;
}
