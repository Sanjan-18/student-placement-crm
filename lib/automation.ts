import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/workflows";

async function alreadySent(userId:string, type:string, relatedId:string, title:string) {
  const since = new Date(Date.now() - 36 * 60 * 60 * 1000);
  return !!(await prisma.notification.findFirst({
    where:{userId,type,relatedId,title,createdAt:{gte:since}}
  }));
}

export async function processPlacementAutomation() {
  const now = new Date();
  const soon = new Date(now.getTime() + 48*60*60*1000);
  const oneDay = new Date(now.getTime() + 24*60*60*1000);

  const expired = await prisma.placementDrive.findMany({
    where:{status:"ACTIVE", applicationDeadline:{lt:now}},
    select:{id:true,role:true,company:{select:{name:true}}}
  });

  for (const d of expired) {
    await prisma.placementDrive.update({where:{id:d.id},data:{status:"CLOSED"}});
    const users = await prisma.user.findMany({
      where:{role:{in:["ADMIN","PLACEMENT_OFFICER"]}},select:{id:true}
    });
    for (const u of users) {
      if(!(await alreadySent(u.id,"DRIVE_CLOSED",d.id,"Placement drive closed")))
        await notifyUser(u.id,"Placement drive closed",`${d.company.name} — ${d.role} has passed its application deadline and is now closed.`,"DRIVE_CLOSED",d.id);
    }
  }

  const deadlines = await prisma.placementDrive.findMany({
    where:{status:"ACTIVE",applicationDeadline:{gt:now,lte:soon}},
    include:{company:true}
  });

  const students = await prisma.student.findMany({
    include:{user:true,applications:{select:{driveId:true}}}
  });

  let deadlineReminders=0;
  for (const d of deadlines) {
    for (const st of students) {
      if(st.applications.some(a=>a.driveId===d.id)) continue;
      const title = d.applicationDeadline && d.applicationDeadline <= oneDay ? "Deadline tomorrow" : "Placement deadline approaching";
      const message = `${d.company.name} — ${d.role} closes on ${d.applicationDeadline ? d.applicationDeadline.toLocaleString() : "N/A"}.`;
      if(!(await alreadySent(st.userId,"DRIVE_DEADLINE",d.id,title))) {
        await notifyUser(st.userId,title,message,"DRIVE_DEADLINE",d.id);
        deadlineReminders++;
      }
    }
  }

  const interviews = await prisma.interview.findMany({
    where:{scheduledAt:{gt:now,lte:soon},result:"PENDING"},
    include:{application:{include:{student:true,drive:{include:{company:true}}}}}
  });

  let interviewReminders=0;
  for (const i of interviews) {
    const title = i.scheduledAt && i.scheduledAt <= oneDay ? "Interview reminder" : "Upcoming interview";
    const message = `${i.round} interview for ${i.application.drive.role} at ${i.application.drive.company.name} is scheduled for ${i.scheduledAt ? i.scheduledAt.toLocaleString() : "TBD"}.`;
    if(!(await alreadySent(i.application.student.userId,"INTERVIEW_REMINDER",i.id,title))) {
      await notifyUser(i.application.student.userId,title,message,"INTERVIEW_REMINDER",i.id);
      interviewReminders++;
    }
  }

  return {
    expiredDrives: expired.length,
    deadlineReminders,
    interviewReminders,
    processedAt: now.toISOString()
  };
}