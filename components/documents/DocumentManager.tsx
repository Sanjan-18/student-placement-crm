"use client";
import {useEffect,useState} from "react";
import ConfirmButton from "@/components/ui/ConfirmButton";

const types=["RESUME","COVER_LETTER","CERTIFICATE","ID_PROOF","OTHER"];
export default function DocumentManager(){
 const [docs,setDocs]=useState<any[]>([]);const [type,setType]=useState("RESUME");const [file,setFile]=useState<File|null>(null);const [msg,setMsg]=useState("");const [saving,setSaving]=useState(false);
 async function load(){const r=await fetch("/api/documents");if(r.ok)setDocs(await r.json())}
 useEffect(()=>{load()},[]);
 async function upload(e:React.FormEvent){e.preventDefault();if(!file){setMsg("Choose a file first.");return}setSaving(true);setMsg("");
  const fd=new FormData();fd.append("file",file);fd.append("type",type);
  const r=await fetch("/api/documents",{method:"POST",body:fd});const d=await r.json();setSaving(false);
  if(r.ok){setFile(null);setMsg("Document uploaded.");const input=document.getElementById("document-file") as HTMLInputElement|null;if(input)input.value="";load()}else setMsg(d.error||"Upload failed.");
 }
 async function remove(id:string){const r=await fetch(`/api/documents/${id}`,{method:"DELETE"});if(r.ok)load();else setMsg("Could not delete document.")}
 return <div className="document-manager">
  <form className="upload-box" onSubmit={upload}><div className="form-grid"><label>Document type<select value={type} onChange={e=>setType(e.target.value)}>{types.map(x=><option key={x}>{x}</option>)}</select></label><label>File<input id="document-file" type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e=>setFile(e.target.files?.[0]||null)}/></label></div><p className="muted">PDF, PNG or JPG · maximum 5 MB</p><div className="form-actions"><button className="primary" disabled={saving}>{saving?"Uploading...":"Upload Document"}</button>{msg&&<span className="form-message">{msg}</span>}</div></form>
  <div className="document-list">{docs.map(d=><article className="document-card" key={d.id}><div className="doc-icon">{d.type==="RESUME"?"CV":"DOC"}</div><div className="doc-main"><strong>{d.name}</strong><span>{d.type.replaceAll("_"," ")} · Version {d.version} · {(d.fileSize/1024/1024).toFixed(2)} MB</span><small>Uploaded {new Date(d.createdAt).toLocaleString()}</small></div><div className="doc-actions"><a className="secondary" href={d.fileUrl} target="_blank" rel="noreferrer">Open</a><ConfirmButton className="danger-link" confirmMessage="Delete this document?" onConfirm={()=>remove(d.id)}>Delete</ConfirmButton></div></article>)}</div>
  {!docs.length&&<div className="empty"><p>No documents uploaded yet.</p></div>}
 </div>
}