import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const allowedTypes=["RESUME","COVER_LETTER","CERTIFICATE","ID_PROOF","OTHER"];
const allowedMime=["application/pdf","image/png","image/jpeg"];

export async function GET(){
 const s=await auth();if(!s?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
 const student=await prisma.student.findUnique({where:{userId:s.user.id}});
 if(!student)return NextResponse.json({error:"Student profile not found"},{status:404});
 const docs=await prisma.studentDocument.findMany({where:{studentId:student.id},orderBy:{createdAt:"desc"}});
 return NextResponse.json(docs);
}

export async function POST(req:Request){
 const s=await auth();if(!s?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
 const student=await prisma.student.findUnique({where:{userId:s.user.id}});
 if(!student)return NextResponse.json({error:"Student profile not found"},{status:404});
 const form=await req.formData();
 const file=form.get("file");const type=String(form.get("type")||"OTHER");
 if(!(file instanceof File))return NextResponse.json({error:"File is required"},{status:400});
 if(!allowedTypes.includes(type))return NextResponse.json({error:"Invalid document type"},{status:400});
 if(!allowedMime.includes(file.type))return NextResponse.json({error:"Only PDF, PNG and JPG files are supported"},{status:400});
 if(file.size>5*1024*1024)return NextResponse.json({error:"Maximum file size is 5 MB"},{status:400});
 const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
 const ext=path.extname(safeName)||".bin";
 const filename=`${student.id}-${crypto.randomUUID()}${ext}`;
 const uploadDir=path.join(process.cwd(),"public","uploads","documents");
 await fs.mkdir(uploadDir,{recursive:true});
 await fs.writeFile(path.join(uploadDir,filename),Buffer.from(await file.arrayBuffer()));
 const previous=await prisma.studentDocument.findFirst({where:{studentId:student.id,type},orderBy:{version:"desc"}});
 const doc=await prisma.studentDocument.create({data:{studentId:student.id,name:safeName,type,fileUrl:`/uploads/documents/${filename}`,fileSize:file.size,mimeType:file.type,version:(previous?.version||0)+1}});
 if(type==="RESUME")await prisma.student.update({where:{id:student.id},data:{resumeUrl:doc.fileUrl}});
 return NextResponse.json(doc,{status:201});
}