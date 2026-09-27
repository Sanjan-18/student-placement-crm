import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";

export async function GET(){
 const session=await auth();if(!session?.user?.email)return NextResponse.json({error:"Unauthorized"},{status:401});
 const user=await prisma.user.findUnique({where:{email:session.user.email}});
 if(!user)return NextResponse.json({error:"User not found"},{status:404});
 const notifications=await prisma.notification.findMany({where:{userId:user.id},orderBy:{createdAt:"desc"},take:50});
 return NextResponse.json(notifications);
}
export async function PATCH(req:Request){
 const session=await auth();if(!session?.user?.email)return NextResponse.json({error:"Unauthorized"},{status:401});
 const user=await prisma.user.findUnique({where:{email:session.user.email}});
 if(!user)return NextResponse.json({error:"User not found"},{status:404});
 const body=await req.json();
 if(body.markAll===true){
   await prisma.notification.updateMany({where:{userId:user.id,isRead:false},data:{isRead:true}});
   return NextResponse.json({success:true});
 }
 const id=String(body.id||"");if(!id)return NextResponse.json({error:"Notification id is required"},{status:400});
 await prisma.notification.updateMany({where:{id,userId:user.id},data:{isRead:true}});
 return NextResponse.json({success:true});
}
