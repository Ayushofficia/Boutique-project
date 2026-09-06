import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isStaffRequest } from "@/lib/auth";

function toClient(row) {
  return { id: row.id, name: row.name, phone: row.phone, message: row.message, date: row.enquiry_date, handled: row.handled };
}

export async function GET(request) {
  if (!isStaffRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.from("enquiries").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(toClient));
}

// Public — this is how the Contact page form submits a lead. No staff auth
// required to create an enquiry, only to read/update/delete them.
export async function POST(request) {
  const body = await request.json();
  if (!body.name || !body.phone) return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("enquiries")
    .insert({ name: body.name, phone: body.phone, message: body.message || "" })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toClient(data));
}
