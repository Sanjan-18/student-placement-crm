import { NextResponse } from "next/server";

export function apiError(message:string,status=400){
  return NextResponse.json({error:message},{status});
}

export function apiServerError(error:unknown){
  console.error(error);
  return NextResponse.json({error:"Internal server error"},{status:500});
}