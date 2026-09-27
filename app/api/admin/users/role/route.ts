import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";

const allowed=["STUDENT","PLACEMENT_OFFICER","ADMIN"] as const;

export async function POST(req:Request){
 const session=await auth();
 if(session?.user?.role!=="ADMIN") return NextResponse.json({error:"Forbidden"},{status:403});
 const form=await req.formData();
 const userId=String(form.get("userId")||"");
 const role=String(form.get("role")||"");
 if(!userId || !allowed.includes(role as any)) return NextResponse.json({error:"Invalid request"},{status:400});
 if(userId===session.user.id && role!=="ADMIN") return NextResponse.json({error:"An admin cannot remove their own admin role."},{status:400});
 await prisma.user.update({where:{id:userId},data:{role:role as any}});
 return NextResponse.redirect(new URL("/admin/users",req.url));
}

export async function PATCH(req:Request){
 const session=await auth();
 if(session?.user?.role!=="ADMIN") return NextResponse.json({error:"Forbidden"},{status:403});
 const body=await req.json();const userId=String(body.userId||"");const role=String(body.role||"");
 if(!userId||!allowed.includes(role as any))return NextResponse.json({error:"Invalid request"},{status:400});
 if(userId===session.user.id&&role!=="ADMIN")return NextResponse.json({error:"An admin cannot remove their own admin role."},{status:400});
 const user=await prisma.user.update({where:{id:userId},data:{role:role as any}});
 return NextResponse.json({id:user.id,role:user.role});
}
