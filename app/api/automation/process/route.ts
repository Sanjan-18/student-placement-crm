import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {processPlacementAutomation} from "@/lib/automation";

export async function POST(req:Request){
  const headerSecret=req.headers.get("x-cron-secret");
  const authHeader=req.headers.get("authorization");
  const bearer=authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const expected=process.env.AUTOMATION_CRON_SECRET || process.env.CRON_SECRET || "";
  const isCron=!!expected && (headerSecret===expected || bearer===expected);
  if(!isCron){
    const s=await auth();
    if(!s?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
    if(!["ADMIN","PLACEMENT_OFFICER"].includes(s.user.role))
      return NextResponse.json({error:"Forbidden"},{status:403});
  }
  try{return NextResponse.json(await processPlacementAutomation());}
  catch(e){console.error("automation error",e);return NextResponse.json({error:"Automation processing failed"},{status:500})}
}

export async function GET(req:Request){
  return POST(req);
}