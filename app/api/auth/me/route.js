import { NextResponse } from "next/server";
import { isStaffRequest } from "@/lib/auth";

export async function GET(request) {
  return NextResponse.json({ authenticated: isStaffRequest(request) });
}
