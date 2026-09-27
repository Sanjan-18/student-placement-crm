"use client";
import {useEffect,useState} from "react";
import ConfirmButton from "@/components/ui/ConfirmButton";

export default function ActivityTimeline({companyId}:{companyId:string}){
 const [items,setItems]=useState<any[]>([]);const [loading,setLoading]=useState(true);
 async function load(){setLoading(true);const r=await fetch(`/api/activities?companyId=${companyId}`);if(r.ok)setItems(await r.json());setLoading(false)}
 useEffect(()=>{load()},[companyId]);
 async function remove(id:string){await fetch(`/api/activities/${id}`,{method:"DELETE"});load()}
 if(loading)return <p className="muted">Loading activity history...</p>;
 if(!items.length)return <div className="empty"><p>No CRM activity recorded yet.</p></div>;
 return <div className="timeline">{items.map(a=><article className="timeline-item" key={a.id}><div className="timeline-dot"/><div className="timeline-body"><div className="timeline-meta"><span className="status-badge status-active">{a.type.replaceAll("_"," ")}</span><span>{new Date(a.createdAt).toLocaleString()}</span></div><h3>{a.subject}</h3>{a.notes&&<p>{a.notes}</p>}<div className="timeline-foot"><span>By {a.user?.name||a.user?.email||"Staff"}</span>{a.dueDate&&<span>Follow-up: {new Date(a.dueDate).toLocaleDateString()}</span>}<ConfirmButton className="danger-link" confirmMessage="Delete this activity?" onConfirm={()=>remove(a.id)}>Delete</ConfirmButton></div></div></article>)}</div>
}