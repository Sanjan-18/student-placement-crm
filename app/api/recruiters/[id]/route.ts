import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
 const s=await auth();if(!s?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
 if(s.user.role==="STUDENT")return NextResponse.json({error:"Forbidden"},{status:403});
 const {id}=await params;const c=await prisma.company.findUnique({where:{id},include:{drives:true}});
 if(!c)return NextResponse.json({error:"Company not found"},{status:404});
 return NextResponse.json(c);
}