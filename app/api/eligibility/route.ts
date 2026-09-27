import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {checkEligibility} from "@/lib/eligibility";
import {NextResponse} from "next/server";

export async function GET(req:Request){
 const session=await auth();if(!session?.user?.email)return NextResponse.json({error:"Unauthorized"},{status:401});
 const driveId=new URL(req.url).searchParams.get("driveId");if(!driveId)return NextResponse.json({error:"driveId is required"},{status:400});
 const user=await prisma.user.findUnique({where:{email:session.user.email},include:{student:true}});
 const drive=await prisma.placementDrive.findUnique({where:{id:driveId}});
 if(!user?.student||!drive)return NextResponse.json({error:"Student or drive not found"},{status:404});
 return NextResponse.json(checkEligibility(user.student,drive));
}
