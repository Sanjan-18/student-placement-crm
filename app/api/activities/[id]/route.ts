import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 const s=await auth();if(!s?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
 if(s.user.role==="STUDENT")return NextResponse.json({error:"Forbidden"},{status:403});
 const {id}=await params,b=await req.json();
 const existing=await prisma.crmActivity.findUnique({where:{id}});
 if(!existing)return NextResponse.json({error:"Activity not found"},{status:404});
 const data:any={};
 for(const k of ["type","subject","notes"])if(b[k]!==undefined)data[k]=b[k]||null;
 if(b.dueDate!==undefined)data.dueDate=b.dueDate?new Date(b.dueDate):null;
 const updated=await prisma.crmActivity.update({where:{id},data});
 return NextResponse.json(updated);
}

export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){
 const s=await auth();if(!s?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
 if(s.user.role==="STUDENT")return NextResponse.json({error:"Forbidden"},{status:403});
 const {id}=await params;
 await prisma.crmActivity.delete({where:{id}});
 return NextResponse.json({success:true});
}