import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";

function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function numberOrNull(value: unknown) { if(value === "" || value === null || value === undefined) return null; const n=Number(value); return Number.isFinite(n) ? n : NaN; }

export async function GET(){
 const session=await auth(); if(!session?.user?.id) return NextResponse.json({error:"Unauthorized"},{status:401});
 const student=await prisma.student.findUnique({where:{userId:session.user.id},include:{user:true}});
 if(!student) return NextResponse.json({error:"Student profile not found"},{status:404});
 return NextResponse.json(student);
}

export async function PATCH(req:Request){
 const session=await auth(); if(!session?.user?.id) return NextResponse.json({error:"Unauthorized"},{status:401});
 const student=await prisma.student.findUnique({where:{userId:session.user.id}});
 if(!student) return NextResponse.json({error:"Student profile not found"},{status:404});
 let body:any; try { body=await req.json(); } catch { return NextResponse.json({error:"Invalid request body"},{status:400}); }
 const data:any={};
 if(body.name!==undefined){const v=text(body.name); if(!v || v.length < 2) return NextResponse.json({error:"Full name must contain at least 2 characters."},{status:400}); if(v.length > 100) return NextResponse.json({error:"Full name is too long."},{status:400});}
 if(body.phone!==undefined){const v=text(body.phone); if(v && !/^\d{10}$/.test(v)) return NextResponse.json({error:"Phone must contain exactly 10 digits."},{status:400}); data.phone=v||null;}
 if(body.usn!==undefined){const v=text(body.usn).toUpperCase(); if(v.length<4) return NextResponse.json({error:"USN is required and must be valid."},{status:400}); data.usn=v;}
 if(body.department!==undefined){const v=text(body.department); if(!v) return NextResponse.json({error:"Department is required."},{status:400}); data.department=v;}
 const graduation=numberOrNull(body.graduationYear); if(body.graduationYear!==undefined){if(Number.isNaN(graduation)||(graduation!==null&&(graduation<2000||graduation>2100||!Number.isInteger(graduation)))) return NextResponse.json({error:"Enter a valid graduation year."},{status:400}); data.graduationYear=graduation;}
 for(const [key,label,min,max] of [["cgpa","CGPA",0,10],["tenthPercentage","10th percentage",0,100],["twelfthPercentage","12th percentage",0,100]] as const){if(body[key]!==undefined){const n=numberOrNull(body[key]); if(Number.isNaN(n)||(n!==null&&(n<min||n>max))) return NextResponse.json({error:`${label} must be between ${min} and ${max}.`},{status:400}); data[key]=n;}}
 if(body.backlogs!==undefined){const n=numberOrNull(body.backlogs); if(Number.isNaN(n)||(n!==null&&(n<0||!Number.isInteger(n)))) return NextResponse.json({error:"Backlogs must be a non-negative whole number."},{status:400}); data.backlogs=n ?? 0;}
 if(body.resumeUrl!==undefined){const v=text(body.resumeUrl); if(v){try {const url=new URL(v); if(url.protocol!=="https:") throw new Error();} catch {return NextResponse.json({error:"Resume URL must be a valid HTTPS URL."},{status:400});}} data.resumeUrl=v||null;}
 try{
   const updated=await prisma.$transaction(async (tx)=>{
     if(body.name!==undefined){ await tx.user.update({where:{id:session.user.id},data:{name:text(body.name)}}); }
     return tx.student.update({where:{id:student.id},data});
   });
   return NextResponse.json(updated);
 }
 catch(e){ return NextResponse.json({error:"Could not update profile. Check that the USN is unique and try again."},{status:400}); }
}
