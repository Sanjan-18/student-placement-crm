import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkEligibility } from "@/lib/eligibility";
import { NextResponse } from "next/server";

export async function POST(_:Request,{params}:{params:Promise<{id:string}>}) {
  const session=await auth();
  if(!session?.user?.email) return NextResponse.json({error:"Unauthorized"},{status:401});
  const {id}=await params;
  const user=await prisma.user.findUnique({where:{email:session.user.email},include:{student:true}});
  if(!user?.student) return NextResponse.json({error:"Student profile not found."},{status:400});
  const drive=await prisma.placementDrive.findUnique({where:{id}});
  if(!drive) return NextResponse.json({error:"Placement drive not found."},{status:404});
  if(drive.status!=="ACTIVE") return NextResponse.json({error:"This placement drive is not active."},{status:400});
  if(drive.applicationDeadline && new Date()>drive.applicationDeadline)
    return NextResponse.json({error:"Application deadline has passed."},{status:400});
  const currentAcceptedOffer = await prisma.offer.findFirst({
    where: { application: { studentId: user.student.id }, status: "ACCEPTED" },
    orderBy: { createdAt: "desc" },
    select: { packageLpa: true },
  });
  const eligibility=checkEligibility(user.student,drive,currentAcceptedOffer?.packageLpa);
  if(!eligibility.eligible)
    return NextResponse.json({error:"You are not eligible for this drive.",reasons:eligibility.reasons},{status:400});
  const existing=await prisma.application.findUnique({where:{studentId_driveId:{studentId:user.student.id,driveId:id}}});
  if(existing) return NextResponse.json({message:"You have already applied to this drive.",applicationId:existing.id});
  const application=await prisma.application.create({data:{studentId:user.student.id,driveId:id}});
  await prisma.notification.create({data:{userId:user.id,title:"Application Submitted",message:`Your application for ${drive.role} has been submitted.`,type:"APPLICATION",relatedId:application.id}});
  return NextResponse.json({message:"Application submitted successfully.",applicationId:application.id},{status:201});
}
