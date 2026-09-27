import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 const session=await auth();if(!session?.user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;const body=await req.json();const status=String(body.status||"").toUpperCase();
 if(!["NOT_PLACED","PLACED","OPTED_OUT"].includes(status))return NextResponse.json({error:"Invalid placement status"},{status:400});
 const student=await prisma.student.findUnique({where:{id}});
 if(!student)return NextResponse.json({error:"Student not found"},{status:404});
 if(session.user.role!=="ADMIN"&&session.user.role!=="PLACEMENT_OFFICER"&&student.userId!==session.user.id)return NextResponse.json({error:"Forbidden"},{status:403});
 const updated=await prisma.student.update({where:{id},data:{placementStatus:status as any}});
 return NextResponse.json(updated);
}
