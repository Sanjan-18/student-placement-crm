import {applicationStatusWorkflow} from "@/lib/workflows";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";

const staffStatuses=["APPLIED","SHORTLISTED","APTITUDE","TECHNICAL","HR","SELECTED","OFFERED"];

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 const session=await auth();if(!session?.user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;const body=await req.json();const next=String(body.status||"").toUpperCase();

 const application=await prisma.application.findUnique({where:{id},include:{student:true,drive:{include:{company:true}}}});
 if(!application)return NextResponse.json({error:"Application not found"},{status:404});
 const isOfficer=["ADMIN","PLACEMENT_OFFICER"].includes(session.user.role);
 const isOwner=application.student.userId===session.user.id;
 if(!isOfficer && !(isOwner && next==="WITHDRAWN"))return NextResponse.json({error:"Forbidden"},{status:403});
 if(isOfficer){
   if(!staffStatuses.includes(next))return NextResponse.json({error:"Admin and Placement Officer status changes are limited to stages through OFFERED."},{status:400});
   if(["ACCEPTED","REJECTED"].includes(application.status))return NextResponse.json({error:"This application is locked after the student offer decision."},{status:400});
 } else if(next!=="WITHDRAWN"){
   return NextResponse.json({error:"Students may only withdraw an active application."},{status:403});
 }
 if(application.status==="ACCEPTED" || application.status==="REJECTED")return NextResponse.json({error:"This application is locked and cannot be changed."},{status:400});
 const updated=await prisma.application.update({where:{id},data:{status:next as any}});
 if(next==="WITHDRAWN"||next==="REJECTED"){
   await prisma.interview.updateMany({where:{applicationId:id,scheduledAt:{not:null},result:null},data:{result:"CANCELLED"}});
 }
 const user=await prisma.user.findUnique({where:{id:application.student.userId}});
 if(user && next!==application.status){
   await prisma.notification.create({data:{userId:user.id,title:"Application Status Updated",message:`Your ${application.drive.role} application at ${application.drive.company.name} is now ${next}.`,type:"APPLICATION",relatedId:id}});
 }
 await applicationStatusWorkflow(id,next);
 return NextResponse.json(updated);
}
