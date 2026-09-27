"use client";
export default function ConfirmButton({children,confirmMessage="Are you sure?",className="secondary",onConfirm}:{children:React.ReactNode;confirmMessage?:string;className?:string;onConfirm:()=>void}){
 return <button type="button" className={className} onClick={()=>{if(window.confirm(confirmMessage))onConfirm();}}>{children}</button>;
}
