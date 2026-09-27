import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";

export async function GET(_:Request,{params}:{params:Promise<{studentId:string}>}){
 const s=await auth();if(!s?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {studentId}=await params;
 const student=await prisma.student.findUnique({where:{id:studentId}});
 if(!student)return NextResponse.json({error:"Student not found"},{status:404});
 if(student.userId!==s.user.id&&!["ADMIN","PLACEMENT_OFFICER"].includes(s.user.role))return NextResponse.json({error:"Forbidden"},{status:403});
 const docs=await prisma.studentDocument.findMany({where:{studentId},orderBy:{createdAt:"desc"}});
 return NextResponse.json(docs);
}