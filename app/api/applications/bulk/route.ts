import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";

const statuses=["APPLIED","SHORTLISTED","APTITUDE","TECHNICAL","HR","SELECTED","OFFERED"];

export async function PATCH(req:Request){
 const session=await auth();if(!session?.user||!["ADMIN","PLACEMENT_OFFICER"].includes(session.user.role))return NextResponse.json({error:"Forbidden"},{status:403});
 const body=await req.json();const ids=Array.isArray(body.ids)?body.ids.map(String):[];const status=String(body.status||"").toUpperCase();
 if(!ids.length||!statuses.includes(status))return NextResponse.json({error:"ids and valid status are required"},{status:400});
 const result=await prisma.application.updateMany({where:{id:{in:ids},status:{notIn:["ACCEPTED","REJECTED"]}},data:{status:status as any}});
 return NextResponse.json({updated:result.count,status});
}
