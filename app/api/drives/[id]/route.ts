import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
 const s=await auth();if(!s?.user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;const d=await prisma.placementDrive.findUnique({where:{id},include:{company:true,applications:true}});
 if(!d)return NextResponse.json({error:"Drive not found"},{status:404});return NextResponse.json(d);
}
export async function PATCH(req: Request, {params}:{params:Promise<{id:string}>}) {
 const s=await auth(); if(!s?.user||!["ADMIN","PLACEMENT_OFFICER"].includes(s.user.role)) return NextResponse.json({error:"Forbidden"},{status:403});
 const {id}=await params;
 try {
  const b=await req.json(); const clean=(v:any)=>typeof v==="string"?v.trim():""; const num=(v:any)=>v===""||v==null?null:Number(v); const dt=(v:any)=>{if(!v)return null;const d=new Date(String(v));return Number.isNaN(d.getTime())?undefined:d};
  const role=clean(b.role), companyId=clean(b.companyId), driveDate=dt(b.driveDate), deadline=dt(b.applicationDeadline);
  if(!role||!companyId)return NextResponse.json({error:"Company and job role are required."},{status:400});
  if(role.length>120)return NextResponse.json({error:"Job role must be 120 characters or less."},{status:400});
  if(driveDate===undefined||deadline===undefined)return NextResponse.json({error:"Enter valid drive and deadline dates."},{status:400});
  if(driveDate&&deadline&&deadline<driveDate)return NextResponse.json({error:"Application deadline cannot be before the drive date."},{status:400});
  const packageLpa=num(b.packageLpa),minCgpa=num(b.minCgpa),maxBacklogs=num(b.maxBacklogs),graduationYear=num(b.graduationYear);
  if(packageLpa!=null&&(!Number.isFinite(packageLpa)||packageLpa<0))return NextResponse.json({error:"Package must be a valid non-negative number."},{status:400});
  if(minCgpa!=null&&(!Number.isFinite(minCgpa)||minCgpa<0||minCgpa>10))return NextResponse.json({error:"Minimum CGPA must be between 0 and 10."},{status:400});
  if(maxBacklogs!=null&&(!Number.isInteger(maxBacklogs)||maxBacklogs<0))return NextResponse.json({error:"Maximum backlogs must be a non-negative whole number."},{status:400});
  if(graduationYear!=null&&(!Number.isInteger(graduationYear)||graduationYear<2000||graduationYear>2100))return NextResponse.json({error:"Graduation year must be between 2000 and 2100."},{status:400});
  const company=await prisma.company.findUnique({where:{id:companyId},select:{id:true}}); if(!company)return NextResponse.json({error:"Selected company was not found."},{status:400});
  const drive=await prisma.placementDrive.update({where:{id},data:{companyId,role,description:clean(b.description)||null,location:clean(b.location)||null,packageLpa,driveDate:driveDate||null,applicationDeadline:deadline||null,minCgpa:minCgpa??0,allowedDepartments:clean(b.allowedDepartments)||null,graduationYear,maxBacklogs:maxBacklogs??0}});
  return NextResponse.json(drive);
 } catch(e:any) { console.error(e); if(e?.code==="P2025")return NextResponse.json({error:"Drive not found."},{status:404}); return NextResponse.json({error:"Could not update placement drive."},{status:500}); }
}

export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){
 const s=await auth();if(!s?.user||!["ADMIN","PLACEMENT_OFFICER"].includes(s.user.role))return NextResponse.json({error:"Forbidden"},{status:403});
 const {id}=await params;await prisma.placementDrive.delete({where:{id}});return NextResponse.json({success:true});
}
