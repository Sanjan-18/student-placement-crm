import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){
 const s=await auth();if(!s?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;
 const doc=await prisma.studentDocument.findUnique({where:{id},include:{student:true}});
 if(!doc)return NextResponse.json({error:"Document not found"},{status:404});
 const owner=doc.student.userId===s.user.id;
 if(!owner && !["ADMIN","PLACEMENT_OFFICER"].includes(s.user.role))return NextResponse.json({error:"Forbidden"},{status:403});
 try{await fs.unlink(path.join(process.cwd(),"public",doc.fileUrl.replace(/^\/+/,"")));}catch{}
 await prisma.studentDocument.delete({where:{id}});
 if(doc.type==="RESUME" && owner)await prisma.student.updateMany({where:{id:doc.studentId,resumeUrl:doc.fileUrl},data:{resumeUrl:null}});
 return NextResponse.json({success:true});
}