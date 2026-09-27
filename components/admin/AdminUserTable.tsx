"use client";
import { useMemo, useState } from "react";

type Role = "STUDENT" | "PLACEMENT_OFFICER" | "ADMIN";
type UserRow = { id:string; name:string|null; email:string|null; role:Role; createdAt:string; hasStudentProfile:boolean };
const roleLabel:Record<Role,string>={STUDENT:"Student",PLACEMENT_OFFICER:"Placement Officer",ADMIN:"Administrator"};

export default function AdminUserTable({users,currentUserId}:{users:UserRow[];currentUserId:string}){
 const [query,setQuery]=useState(""); const [roleFilter,setRoleFilter]=useState<"ALL"|Role>("ALL");
 const [rows,setRows]=useState(users); const [savingId,setSavingId]=useState<string|null>(null);
 const [message,setMessage]=useState<{type:"success"|"error";text:string}|null>(null);
 const filtered=useMemo(()=>{const n=query.trim().toLowerCase();return rows.filter(u=>(!n||`${u.name??""} ${u.email??""}`.toLowerCase().includes(n))&&(roleFilter==="ALL"||u.role===roleFilter));},[rows,query,roleFilter]);
 const counts=useMemo(()=>rows.reduce<Record<string,number>>((a,u)=>{a[u.role]=(a[u.role]||0)+1;return a},{}),[rows]);
 async function updateRole(userId:string,role:Role){setMessage(null);const old=rows.find(u=>u.id===userId)?.role;if(!old||old===role)return;if(userId===currentUserId&&role!=="ADMIN"){setMessage({type:"error",text:"You cannot remove your own administrator access."});return}setSavingId(userId);try{const res=await fetch("/api/admin/users/role",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId,role})});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.error||"Unable to update the role.");setRows(c=>c.map(u=>u.id===userId?{...u,role:data.role}:u));setMessage({type:"success",text:"User role updated successfully."});}catch(e){setMessage({type:"error",text:e instanceof Error?e.message:"Unable to update the role."});}finally{setSavingId(null)}}
 return <div className="admin-users-module">
  <div className="admin-user-kpis"><K t="Total users" v={rows.length} s="All registered accounts"/><K t="Students" v={counts.STUDENT||0} s="Student accounts"/><K t="Placement officers" v={counts.PLACEMENT_OFFICER||0} s="Staff accounts"/><K t="Administrators" v={counts.ADMIN||0} s="Privileged accounts"/></div>
  <section className="panel admin-users-panel"><div className="section-heading"><div><h2>Users & access</h2><p>Search accounts and change roles without leaving this page.</p></div><span className="admin-result-count">{filtered.length} shown</span></div>
   <div className="admin-user-filters"><label><span className="sr-only">Search users</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name or email…"/></label><label><span className="sr-only">Filter by role</span><select value={roleFilter} onChange={e=>setRoleFilter(e.target.value as "ALL"|Role)}><option value="ALL">All roles</option><option value="STUDENT">Students</option><option value="PLACEMENT_OFFICER">Placement officers</option><option value="ADMIN">Administrators</option></select></label>{(query||roleFilter!=="ALL")&&<button className="secondary" onClick={()=>{setQuery("");setRoleFilter("ALL")}}>Clear</button>}</div>
   {message&&<div className={`action-feedback ${message.type}`} role="status">{message.text}</div>}
   <div className="admin-user-table-wrap"><div className="admin-user-table admin-user-table-head"><span>User</span><span>Role</span><span>Profile</span><span>Joined</span><span>Access</span></div>
    {filtered.length===0?<div className="admin-user-empty"><strong>No users match these filters</strong><span>Try another name, email address, or role.</span></div>:filtered.map(u=>{const self=u.id===currentUserId;return <div className="admin-user-table admin-user-table-row" key={u.id}><div className="admin-user-identity"><span className="admin-user-avatar">{(u.name||u.email||"U").slice(0,1).toUpperCase()}</span><span><strong>{u.name||"Unnamed user"}</strong><small>{u.email||"No email"}</small></span></div><span><b className={`admin-role-badge ${u.role.toLowerCase()}`}>{roleLabel[u.role]}</b></span><span className={u.hasStudentProfile?"profile-present":"profile-missing"}>{u.hasStudentProfile?"Student profile":"Not applicable"}</span><span className="admin-date">{new Date(u.createdAt).toLocaleDateString()}</span><div className="admin-role-action"><select aria-label={`Role for ${u.name||u.email||"user"}`} value={u.role} disabled={savingId===u.id||self} onChange={e=>updateRole(u.id,e.target.value as Role)}><option value="STUDENT">Student</option><option value="PLACEMENT_OFFICER">Placement Officer</option><option value="ADMIN">Administrator</option></select>{self&&<small>Current account</small>}{savingId===u.id&&<small>Saving…</small>}</div></div>})}
   </div></section>
 </div>
}
function K({t,v,s}:{t:string;v:number;s:string}){return <div className="panel admin-user-kpi"><span>{t}</span><strong>{v}</strong><small>{s}</small></div>}
