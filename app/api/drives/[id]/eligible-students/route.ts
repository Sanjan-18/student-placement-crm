import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {checkEligibility} from "@/lib/eligibility";

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
 const s=await auth(); if(!s?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
 if(s.user.role==="STUDENT")return NextResponse.json({error:"Forbidden"},{status:403});
 const {id}=await params;
 const drive=await prisma.placementDrive.findUnique({where:{id}});
 if(!drive)return NextResponse.json({error:"Drive not found"},{status:404});
 const students=await prisma.student.findMany({include:{user:true}});
 const rows=students.map(student=>{
  const result=checkEligibility(student,drive);
  return {id:student.id,name:student.user.name,email:student.user.email,usn:student.usn,department:student.department,cgpa:student.cgpa,backlogs:student.backlogs,placementStatus:student.placementStatus,eligible:result.eligible,reasons:result.reasons};
 });
 return NextResponse.json({drive,eligible:rows.filter(x=>x.eligible),ineligible:rows.filter(x=>!x.eligible),total:rows.length});
}