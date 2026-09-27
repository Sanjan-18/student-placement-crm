import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";

const defaults={push:true,announcements:true,applications:true,interviews:true,offers:true,deadlines:true};
export async function GET(){
 const s=await auth();if(!s?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
 const u=await prisma.user.findUnique({where:{id:s.user.id},select:{notificationPreferences:true}});
 return NextResponse.json({...defaults,...((u?.notificationPreferences as any)||{})});
}
export async function PATCH(req:Request){
 const s=await auth();if(!s?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
 const b=await req.json();
 const current=await prisma.user.findUnique({where:{id:s.user.id},select:{notificationPreferences:true}});
 const preferences={...defaults,...((current?.notificationPreferences as any)||{}),...b};
 const u=await prisma.user.update({where:{id:s.user.id},data:{notificationPreferences:preferences},select:{notificationPreferences:true}});
 return NextResponse.json(u.notificationPreferences);
}