import { prisma } from "@/lib/prisma";
import { firebaseMessaging } from "@/lib/firebase-admin";

export async function sendPushToUser(userId:string,title:string,body:string,data:Record<string,string>={}){
  if(!firebaseMessaging)return {sent:0,failed:0};
  const tokens=await prisma.fcmToken.findMany({where:{userId},select:{token:true}});
  if(!tokens.length)return {sent:0,failed:0};
  let sent=0,failed=0;
  for(const item of tokens){
    try{
      await firebaseMessaging.send({
        token:item.token,
        notification:{title,body},
        data
      });
      sent++;
    }catch{
      failed++;
      await prisma.fcmToken.deleteMany({where:{token:item.token}});
    }
  }
  return {sent,failed};
}
