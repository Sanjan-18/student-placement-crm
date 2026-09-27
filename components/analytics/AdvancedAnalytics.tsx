"use client";
import {useEffect,useState} from "react";

function Bar({value,max}:{value:number;max:number}){return <div className="chart-track"><div className="chart-bar" style={{width:`${max?Math.max(4,value/max*100):0}%`}}/></div>}
export default function AdvancedAnalytics(){
 const [d,setD]=useState<any>(null);
 useEffect(()=>{fetch("/api/analytics/advanced").then(r=>r.ok?r.json():null).then(setD).catch(()=>{})},[]);
 if(!d)return <div className="panel"><p className="muted">Loading advanced analytics...</p></div>;
 const maxPlaced=Math.max(...d.department.map((x:any)=>x.placed),1),maxSel=Math.max(...d.companies.map((x:any)=>x.selected),1),maxPkg=Math.max(...d.packages.map((x:any)=>x.count),1);
 return <div className="advanced-analytics">
  <div className="analytics-kpis"><div className="panel"><strong>{d.totals.students}</strong><span>Students</span></div><div className="panel"><strong>{d.totals.placed}</strong><span>Placed</span></div><div className="panel"><strong>{d.totals.applications}</strong><span>Applications</span></div><div className="panel"><strong>{d.totals.offers}</strong><span>Offers</span></div></div>
  <div className="advanced-grid">
   <section className="panel chart-panel"><h2>Department placement</h2>{d.department.map((x:any)=><div className="chart-row" key={x.department}><div className="chart-label"><span>{x.department}</span><b>{x.placed}/{x.students} · {x.rate}%</b></div><Bar value={x.placed} max={maxPlaced}/></div>)}</section>
   <section className="panel chart-panel"><h2>Company hiring conversion</h2>{d.companies.slice(0,10).map((x:any)=><div className="chart-row" key={x.company}><div className="chart-label"><span>{x.company}</span><b>{x.selected} · {x.conversion}%</b></div><Bar value={x.selected} max={maxSel}/></div>)}{!d.companies.length&&<div className="empty"><p>No company data yet.</p></div>}</section>
   <section className="panel chart-panel"><h2>Package distribution</h2>{d.packages.map((x:any)=><div className="chart-row" key={x.range}><div className="chart-label"><span>{x.range} LPA</span><b>{x.count}</b></div><Bar value={x.count} max={maxPkg}/></div>)}</section>
   <section className="panel chart-panel"><h2>Graduation year placement</h2>{d.graduationYears.map((x:any)=><div className="year-card" key={x.year}><strong>{x.year}</strong><span>{x.placed} placed / {x.students} students</span><b>{x.students?Math.round(x.placed/x.students*100):0}%</b></div>)}</section>
  </div>
 </div>
}