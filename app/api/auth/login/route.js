import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { signStaffToken, staffCookieOptions } from "@/lib/auth";

export async function POST(request) {
  const { pin } = await request.json();
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.from("settings").select("staff_pin").eq("id", 1).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!pin || pin !== data.staff_pin) {
    return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
  }

  const token = signStaffToken();
  const res = NextResponse.json({ ok: true });
  const cookie = staffCookieOptions();
  res.cookies.set(cookie.name, token, cookie);
  return res;
}
