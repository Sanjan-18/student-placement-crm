import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";

export async function POST(req:Request){
 const session=await auth();if(!session?.user?.email)return NextResponse.json({error:"Unauthorized"},{status:401});
 const body=await req.json();const token=String(body.token||"").trim();if(!token)return NextResponse.json({error:"FCM token is required"},{status:400});
 const user=await prisma.user.findUnique({where:{email:session.user.email}});
 if(!user)return NextResponse.json({error:"User not found"},{status:404});
 const record=await prisma.fcmToken.upsert({
   where:{token},
   update:{userId:user.id,deviceType:body.deviceType||"WEB"},
   create:{userId:user.id,token,deviceType:body.deviceType||"WEB"}
 });
 return NextResponse.json({success:true,id:record.id});
}
export async function DELETE(req:Request){
 const session=await auth();if(!session?.user?.email)return NextResponse.json({error:"Unauthorized"},{status:401});
 const body=await req.json();const token=String(body.token||"").trim();
 if(token)await prisma.fcmToken.deleteMany({where:{token}});
 return NextResponse.json({success:true});
}
