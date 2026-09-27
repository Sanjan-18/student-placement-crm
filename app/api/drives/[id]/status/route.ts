import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 const session=await auth();if(!session?.user||!["ADMIN","PLACEMENT_OFFICER"].includes(session.user.role))return NextResponse.json({error:"Forbidden"},{status:403});
 const {id}=await params;const body=await req.json();const status=String(body.status||"").toUpperCase();
 const allowed=["ACTIVE","CLOSED","COMPLETED","CANCELLED"];
 if(!allowed.includes(status))return NextResponse.json({error:"Invalid drive status"},{status:400});
 const drive=await prisma.placementDrive.update({where:{id},data:{status}});
 return NextResponse.json(drive);
}
