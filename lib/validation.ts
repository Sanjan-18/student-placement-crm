import {z} from "zod";

export const idSchema=z.string().min(1).max(100);
export const applicationStatusSchema=z.enum(["APPLIED","SHORTLISTED","APTITUDE","TECHNICAL","HR","SELECTED","REJECTED","OFFERED","ACCEPTED","WITHDRAWN"]);
export const driveStatusSchema=z.enum(["ACTIVE","CLOSED","COMPLETED","CANCELLED"]);
export const placementStatusSchema=z.enum(["NOT_PLACED","PLACED","OPTED_OUT"]);
export const emailSchema=z.string().email().max(320);
export const paginationSchema=z.object({
  page:z.coerce.number().int().min(1).max(10000).default(1),
  pageSize:z.coerce.number().int().min(1).max(100).default(20),
  search:z.string().trim().max(120).optional()
});
export function parseJson<T extends z.ZodTypeAny>(schema:T,body:unknown){
 const result=schema.safeParse(body);
 if(!result.success) return {ok:false as const,error:result.error.flatten()};
 return {ok:true as const,data:result.data as z.infer<T>};
}