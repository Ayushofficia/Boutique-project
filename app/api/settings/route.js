import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isStaffRequest } from "@/lib/auth";

function toClient(row) {
  return {
    shopName: row.shop_name,
    ownerName: row.owner_name,
    tagline: row.tagline,
    subline: row.subline,
    heroImage: row.hero_image,
    address: row.address,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    instagram: row.instagram,
    facebook: row.facebook,
    hours: row.hours,
    staffPin: row.staff_pin,
  };
}

export async function GET() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const result = toClient(data);
  // Don't leak the PIN to the public site — only the staff dashboard needs it,
  // and it only ever checks it server-side via /api/auth/login anyway.
  delete result.staffPin;
  return NextResponse.json(result);
}

export async function PUT(request) {
  if (!isStaffRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const supabase = supabaseAdmin();
  const update = {
    shop_name: body.shopName,
    owner_name: body.ownerName,
    tagline: body.tagline,
    subline: body.subline,
    hero_image: body.heroImage,
    address: body.address,
    phone: body.phone,
    whatsapp: body.whatsapp,
    email: body.email,
    instagram: body.instagram,
    facebook: body.facebook,
    hours: body.hours,
  };
  if (body.staffPin) update.staff_pin = body.staffPin;
  const { data, error } = await supabase.from("settings").update(update).eq("id", 1).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const result = toClient(data);
  delete result.staffPin;
  return NextResponse.json(result);
}
