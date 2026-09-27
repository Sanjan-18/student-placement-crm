"use client";
import {useEffect,useState} from "react";
import Link from "next/link";

export default function ReminderCenter(){
 const [data,setData]=useState<any>({interviews:[],deadlines:[],applications:[]});
 const [open,setOpen]=useState(false);
 useEffect(()=>{fetch("/api/notifications/reminders").then(r=>r.ok?r.json():null).then(d=>d&&setData(d)).catch(()=>{})},[]);
 const count=data.interviews.length+data.deadlines.length;
 return <div className="reminder-wrap"><button className="reminder-button" onClick={()=>setOpen(!open)} aria-label="Open reminders">🔔{count>0&&<span>{count}</span>}</button>{open&&<div className="reminder-popover"><div className="reminder-head"><strong>Upcoming reminders</strong><button onClick={()=>setOpen(false)}>×</button></div>
 {data.interviews.map((x:any)=><Link key={x.id} href={`/interviews/${x.id}`} onClick={()=>setOpen(false)} className="reminder-item"><b>Interview: {x.round}</b><span>{x.company} · {x.role}</span><small>{new Date(x.scheduledAt).toLocaleString()}</small></Link>)}
 {data.deadlines.map((x:any)=><Link key={x.id} href={`/drives/${x.id}`} onClick={()=>setOpen(false)} className="reminder-item"><b>Application deadline</b><span>{x.company} · {x.role}</span><small>{new Date(x.deadline).toLocaleString()}</small></Link>)}
 {!count&&<div className="empty"><p>No urgent reminders.</p></div>}
 </div>}</div>
}