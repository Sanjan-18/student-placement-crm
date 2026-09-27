import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
export async function GET(){
 const s=await auth();if(!s?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
 const where=s.user.role==="STUDENT"?{application:{student:{userId:s.user.id}}}:{};
 const data=await prisma.interview.findMany({where,orderBy:{scheduledAt:"asc"},include:{application:{include:{student:{include:{user:true}},drive:{include:{company:true}}}}}});
 return NextResponse.json(data);
}