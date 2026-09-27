"use client";
import {useMemo,useState} from "react";
const stages=["APPLIED","SHORTLISTED","APTITUDE","TECHNICAL","HR","SELECTED","OFFERED","ACCEPTED"];
export default function CandidatePipeline({applications}:{applications:any[]}){
 const [q,setQ]=useState(""); const [stage,setStage]=useState("ALL");
 const data=useMemo(()=>applications.filter(a=>{const name=a.student?.user?.name||"";const usn=a.student?.usn||"";return `${name} ${usn}`.toLowerCase().includes(q.toLowerCase())&&(stage==="ALL"||a.status===stage)}),[applications,q,stage]);
 return <section className="panel"><div className="pipeline-tools"><input placeholder="Search candidate or USN..." value={q} onChange={e=>setQ(e.target.value)}/><select value={stage} onChange={e=>setStage(e.target.value)}><option>ALL</option>{stages.map(x=><option key={x}>{x}</option>)}</select></div><div className="pipeline-board">{stages.map(st=>{const items=data.filter(a=>a.status===st);return <div className="pipeline-column" key={st}><div className="pipeline-title"><strong>{st}</strong><span>{items.length}</span></div>{items.map(a=><article className="pipeline-card" key={a.id}><strong>{a.student.user.name||a.student.user.email}</strong><span>{a.student.usn||"No USN"}</span><small>{a.drive.role} · {a.drive.company.name}</small>{a.offer&&<small>Offer: {a.offer.packageLpa} LPA</small>}</article>)}</div>})}</div></section>
}