"use client";
import {useState} from "react";
import Link from "next/link";
export default function EligibilityTable({rows}:{rows:any[]}){
 const [q,setQ]=useState("");
 const filtered=rows.filter(x=>[x.name,x.email,x.usn,x.department].filter(Boolean).join(" ").toLowerCase().includes(q.toLowerCase()));
 return <div><div className="eligibility-search"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search eligible students..."/><span>{filtered.length} students</span></div><div className="table-panel"><div className="table-head eligibility-head"><span>Student</span><span>Department</span><span>CGPA</span><span>Backlogs</span><span>Status</span><span/></div>{filtered.map(x=><div className="table-row eligibility-head" key={x.id}><span><strong>{x.name||"Unnamed"}</strong><small>{x.email} {x.usn?`· ${x.usn}`:""}</small></span><span>{x.department||"—"}</span><span>{x.cgpa??"—"}</span><span>{x.backlogs}</span><span><span className="status-badge status-placed">{x.placementStatus.replaceAll("_"," ")}</span></span><span><Link className="secondary" href={`/students/${x.id}`}>Profile</Link></span></div>)}</div>{!filtered.length&&<div className="empty"><p>No matching students.</p></div>}</div>
}