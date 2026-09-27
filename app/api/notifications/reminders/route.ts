import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";

export async function GET(){
 const s=await auth();if(!s?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
 const now=new Date(), soon=new Date(now.getTime()+48*60*60*1000);
 const [interviews,drives,apps]=await Promise.all([
  prisma.interview.findMany({where:{scheduledAt:{gte:now,lte:soon},application:{student:{userId:s.user.id}}},include:{application:{include:{drive:{include:{company:true}}}}}}),
  prisma.placementDrive.findMany({where:{applicationDeadline:{gte:now,lte:soon}},include:{company:true}}),
  prisma.application.findMany({where:{student:{userId:s.user.id}},include:{drive:{include:{company:true}}}})
 ]);
 return NextResponse.json({
  interviews:interviews.map(i=>({id:i.id,scheduledAt:i.scheduledAt,round:i.round,company:i.application.drive.company.name,role:i.application.drive.role})),
  deadlines:drives.map(d=>({id:d.id,deadline:d.applicationDeadline,company:d.company.name,role:d.role})),
  applications:apps.map(a=>({id:a.id,status:a.status,company:a.drive.company.name,role:a.drive.role}))
 });
}