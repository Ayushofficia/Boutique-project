import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isStaffRequest } from "@/lib/auth";

export async function PUT(request, { params }) {
  if (!isStaffRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("alterations")
    .update({ name: body.name, price: Number(body.price) || 0, description: body.description })
    .eq("id", params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id, name: data.name, price: Number(data.price), description: data.description });
}

export async function DELETE(request, { params }) {
  if (!isStaffRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = supabaseAdmin();
  const { error } = await supabase.from("alterations").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
