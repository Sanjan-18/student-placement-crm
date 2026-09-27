 "use client";
export default function GlobalError({reset}:{error:Error&{digest?:string};reset:()=>void}){
 return <html><body><main style={{fontFamily:"system-ui",padding:40,maxWidth:700,margin:"auto"}}><h1>Something went wrong</h1><p>The Placement CRM encountered an unexpected error.</p><button onClick={()=>reset()} style={{padding:"10px 16px"}}>Try again</button></main></body></html>
}