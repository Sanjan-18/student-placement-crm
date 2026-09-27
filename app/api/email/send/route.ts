import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";

export async function POST(req:Request){
 const s=await auth();if(!s?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
 if(!["ADMIN","PLACEMENT_OFFICER"].includes(s.user.role))return NextResponse.json({error:"Forbidden"},{status:403});
 const b=await req.json();if(!b.to||!b.subject||!b.message)return NextResponse.json({error:"to, subject and message are required"},{status:400});
 const webhook=process.env.EMAIL_WEBHOOK_URL;
 if(!webhook)return NextResponse.json({error:"EMAIL_WEBHOOK_URL is not configured. Connect an email provider to send messages."},{status:503});
 try{
  const r=await fetch(webhook,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:b.to,subject:b.subject,message:b.message,from:process.env.EMAIL_FROM||""})});
  if(!r.ok)return NextResponse.json({error:"Email provider rejected the message"},{status:502});
  return NextResponse.json({success:true});
 }catch{return NextResponse.json({error:"Email provider unavailable"},{status:502})}
}