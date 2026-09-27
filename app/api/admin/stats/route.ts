import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";

export async function GET(){
 const session=await auth();
 if(session?.user?.role!=="ADMIN")return NextResponse.json({error:"Forbidden"},{status:403});
 const [users,students,officers,admins,companies,drives]=await Promise.all([
  prisma.user.count(),prisma.user.count({where:{role:"STUDENT"}}),prisma.user.count({where:{role:"PLACEMENT_OFFICER"}}),
  prisma.user.count({where:{role:"ADMIN"}}),prisma.company.count(),prisma.placementDrive.count()
 ]);
 return NextResponse.json({users,students,officers,admins,companies,drives});
}
