import { NextResponse } from "next/server";
import { staffCookieOptions } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const cookie = staffCookieOptions();
  res.cookies.set(cookie.name, "", { ...cookie, maxAge: 0 });
  return res;
}
