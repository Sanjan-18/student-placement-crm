"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";

export default function DriveStatusControl({id,current}:{id:string;current:string}){
 const [status,setStatus]=useState(current);const [loading,setLoading]=useState(false);const router=useRouter();
 async function update(v:string){
  setStatus(v);setLoading(true);
  const res=await fetch(`/api/drives/${id}/status`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:v})});
  if(res.ok)router.refresh();else setStatus(current);
  setLoading(false);
 }
 return <select value={status} disabled={loading} onChange={e=>update(e.target.value)}><option>ACTIVE</option><option>CLOSED</option><option>COMPLETED</option><option>CANCELLED</option></select>;
}
