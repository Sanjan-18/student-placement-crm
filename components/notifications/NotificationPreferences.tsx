"use client";
import {useEffect,useState} from "react";
const fields=[["push","Push notifications"],["announcements","Announcements"],["applications","Application updates"],["interviews","Interview reminders"],["offers","Offer updates"],["deadlines","Deadline reminders"]];
export default function NotificationPreferences(){
 const [p,setP]=useState<any>(null);const [msg,setMsg]=useState("");
 useEffect(()=>{fetch("/api/notification-preferences").then(r=>r.json()).then(setP)},[]);
 async function toggle(k:string){const next={...p,[k]:!p[k]};setP(next);const r=await fetch("/api/notification-preferences",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({[k]:next[k]})});setMsg(r.ok?"Preferences saved.":"Could not save preferences.");}
 if(!p)return <section className="panel"><p>Loading preferences...</p></section>;
 return <section className="panel preference-list">{fields.map(([k,label])=><label className="preference-row" key={k}><span><strong>{label}</strong><small>{k==="push"?"Browser push delivery":`Receive ${label.toLowerCase()}`}</small></span><input type="checkbox" checked={!!p[k]} onChange={()=>toggle(k)}/></label>)}{msg&&<p className="form-message">{msg}</p>}</section>
}