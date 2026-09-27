"use client";
import {useState} from "react";

export default function ActivityForm({companyId,onSaved}:{companyId:string;onSaved?:()=>void}){
 const [form,setForm]=useState({type:"NOTE",subject:"",notes:"",dueDate:""});
 const [saving,setSaving]=useState(false);const [msg,setMsg]=useState("");
 async function submit(e:React.FormEvent){e.preventDefault();setSaving(true);setMsg("");
  const r=await fetch("/api/activities",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,companyId})});
  const d=await r.json();setSaving(false);
  if(r.ok){setForm({type:"NOTE",subject:"",notes:"",dueDate:""});setMsg("Activity added.");onSaved?.();}else setMsg(d.error||"Could not add activity.");
 }
 return <form className="activity-form" onSubmit={submit}>
  <div className="form-grid"><label>Type<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{["NOTE","CALL","EMAIL","MEETING","FOLLOW_UP","OTHER"].map(x=><option key={x}>{x}</option>)}</select></label>
  <label>Follow-up date<input type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></label>
  <label className="full">Subject<input required value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="Discussed upcoming placement drive"/></label>
  <label className="full">Notes<textarea rows={4} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Add important details..."/></label></div>
  <div className="form-actions"><button className="primary" disabled={saving}>{saving?"Saving...":"Add Activity"}</button>{msg&&<span className="form-message">{msg}</span>}</div>
 </form>
}