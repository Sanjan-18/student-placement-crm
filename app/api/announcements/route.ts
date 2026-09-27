import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {notifyUser} from "@/lib/workflows";

export async function GET(){
 const s=await auth();if(!s?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
 const items=await prisma.notification.findMany({where:{userId:s.user.id,type:"ANNOUNCEMENT"},orderBy:{createdAt:"desc"},take:50});
 return NextResponse.json(items);
}
export async function POST(req:Request){
 const s=await auth();if(!s?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
 if(!["ADMIN","PLACEMENT_OFFICER"].includes(s.user.role))return NextResponse.json({error:"Forbidden"},{status:403});
 const b=await req.json();if(!b.title||!b.message)return NextResponse.json({error:"Title and message are required"},{status:400});
 const where:any={}; if(b.role&&b.role!=="ALL")where.role=b.role;
 const users=await prisma.user.findMany({where,select:{id:true}});
 let count=0; for(const u of users){await notifyUser(u.id,b.title,b.message,"ANNOUNCEMENT",b.relatedId);count++}
 return NextResponse.json({sent:count});
}