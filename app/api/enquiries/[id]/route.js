import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isStaffRequest } from "@/lib/auth";

export async function PUT(request, { params }) {
  if (!isStaffRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("enquiries")
    .update({ handled: !!body.handled })
    .eq("id", params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id, name: data.name, phone: data.phone, message: data.message, date: data.enquiry_date, handled: data.handled });
}

export async function DELETE(request, { params }) {
  if (!isStaffRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = supabaseAdmin();
  const { error } = await supabase.from("enquiries").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
