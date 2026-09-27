"use client";
import {useState} from "react";
export default function RecruiterEditor({company}:{company:any}){
 const [form,setForm]=useState({recruiter:company.recruiter||"",recruiterEmail:company.recruiterEmail||""});
 const [saving,setSaving]=useState(false);const [msg,setMsg]=useState("");
 async function save(e:React.FormEvent){e.preventDefault();setSaving(true);setMsg("");
  const r=await fetch(`/api/companies/${company.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
  const d=await r.json();setSaving(false);setMsg(r.ok?"Recruiter details saved.":d.error||"Could not save.");
 }
 return <form onSubmit={save} className="form-card compact-form"><label>Recruiter Name<input value={form.recruiter} onChange={e=>setForm({...form,recruiter:e.target.value})} placeholder="Recruiter name"/></label><label>Recruiter Email<input type="email" value={form.recruiterEmail} onChange={e=>setForm({...form,recruiterEmail:e.target.value})} placeholder="recruiter@company.com"/></label><div className="form-actions"><button className="primary" disabled={saving}>{saving?"Saving...":"Save Contact"}</button>{msg&&<span className="form-message">{msg}</span>}</div></form>
}