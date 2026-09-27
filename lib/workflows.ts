import {prisma} from "@/lib/prisma";
import {sendPushToUser} from "@/lib/notifications";

export async function notifyUser(userId:string,title:string,message:string,type:string,relatedId?:string){
 const notification=await prisma.notification.create({data:{userId,title,message,type,relatedId}});
 try{await sendPushToUser(userId,title,message,{type,relatedId:relatedId||""})}catch{}
 return notification;
}

export async function applicationStatusWorkflow(applicationId:string,status:string){
 const a=await prisma.application.findUnique({where:{id:applicationId},include:{student:{include:{user:true}},drive:{include:{company:true}}}});
 if(!a)return;
 await notifyUser(a.student.userId,"Application status updated",`Your application for ${a.drive.role} at ${a.drive.company.name} is now ${status}.`,"APPLICATION_STATUS",applicationId);
}

export async function interviewWorkflow(interviewId:string){
 const i=await prisma.interview.findUnique({where:{id:interviewId},include:{application:{include:{student:{include:{user:true}},drive:{include:{company:true}}}}}});
 if(!i)return;
 await notifyUser(i.application.student.userId,"Interview scheduled",`Your ${i.round} interview for ${i.application.drive.role} at ${i.application.drive.company.name} is scheduled for ${i.scheduledAt ? new Date(i.scheduledAt).toLocaleString() : "TBD"}.`,"INTERVIEW",interviewId);
}

export async function offerWorkflow(offerId:string){
 const o=await prisma.offer.findUnique({where:{id:offerId},include:{application:{include:{student:{include:{user:true}},drive:{include:{company:true}}}}}});
 if(!o)return;
 await notifyUser(o.application.student.userId,"Offer update",`Your offer for ${o.application.drive.role} at ${o.application.drive.company.name} is ${o.status}.`,"OFFER",offerId);
}