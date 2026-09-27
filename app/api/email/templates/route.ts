import {NextResponse} from "next/server";
import {auth} from "@/auth";
export async function GET(){
 const s=await auth();if(!s?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
 if(!["ADMIN","PLACEMENT_OFFICER"].includes(s.user.role))return NextResponse.json({error:"Forbidden"},{status:403});
 return NextResponse.json([
  {id:"application",name:"Application status",subject:"Placement application update — {{company}}",message:"Hello {{student}},\n\nYour application for {{role}} at {{company}} has moved to {{status}}.\n\nPlacement Team"},
  {id:"interview",name:"Interview invitation",subject:"Interview scheduled — {{company}}",message:"Hello {{student}},\n\nYour {{round}} interview for {{role}} at {{company}} is scheduled for {{date}}.\n\nMeeting: {{meetingLink}}\n\nPlacement Team"},
  {id:"offer",name:"Offer notification",subject:"Offer update — {{company}}",message:"Hello {{student}},\n\nYour offer for {{role}} at {{company}} has been updated to {{status}}.\n\nPlacement Team"},
  {id:"deadline",name:"Deadline reminder",subject:"Application deadline reminder — {{company}}",message:"Hello {{student}},\n\nThe application deadline for {{role}} at {{company}} is {{deadline}}.\n\nPlacement Team"}
 ]);
}