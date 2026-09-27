import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {sendPushToUser} from "@/lib/notifications";
import {NextResponse} from "next/server";

export async function POST(req:Request){
 const session=await auth();
 if(!session?.user||!["ADMIN","PLACEMENT_OFFICER"].includes(session.user.role))
   return NextResponse.json({error:"Forbidden"},{status:403});
 const body=await req.json();
 const userId=String(body.userId||"");const title=String(body.title||"Placement CRM");const message=String(body.message||"");
 if(!userId||!message)return NextResponse.json({error:"userId and message are required"},{status:400});
 const notification=await prisma.notification.create({data:{userId,title,message,type:body.type||"SYSTEM",relatedId:body.relatedId||null}});
 const push=await sendPushToUser(userId,title,message,{notificationId:notification.id});
 return NextResponse.json({notification,push});
}
