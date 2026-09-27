import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";

const allowed=["CALL","EMAIL","MEETING","NOTE","FOLLOW_UP","OTHER"];

export async function POST(req:Request){
 const s=await auth(); if(!s?.user?.id) return NextResponse.json({error:"Unauthorized"},{status:401});
 if(s.user.role==="STUDENT") return NextResponse.json({error:"Forbidden"},{status:403});
 const b=await req.json();
 if(!b.companyId||!b.subject) return NextResponse.json({error:"Company and subject are required"},{status:400});
 if(!allowed.includes(b.type||"NOTE")) return NextResponse.json({error:"Invalid activity type"},{status:400});
 const company=await prisma.company.findUnique({where:{id:b.companyId}});
 if(!company) return NextResponse.json({error:"Company not found"},{status:404});
 const activity=await prisma.crmActivity.create({data:{
  companyId:b.companyId,userId:s.user.id,type:b.type||"NOTE",subject:String(b.subject).trim(),
  notes:b.notes?String(b.notes).trim():null,dueDate:b.dueDate?new Date(b.dueDate):null
 }});
 return NextResponse.json(activity,{status:201});
}

export async function GET(req:Request){
 const s=await auth(); if(!s?.user?.id) return NextResponse.json({error:"Unauthorized"},{status:401});
 if(s.user.role==="STUDENT") return NextResponse.json({error:"Forbidden"},{status:403});
 const {searchParams}=new URL(req.url); const companyId=searchParams.get("companyId");
 const activities=await prisma.crmActivity.findMany({
  where:companyId?{companyId}:undefined,orderBy:{createdAt:"desc"},include:{company:true,user:{select:{name:true,email:true}}},take:100
 });
 return NextResponse.json(activities);
}