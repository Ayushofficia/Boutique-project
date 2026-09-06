import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isStaffRequest } from "@/lib/auth";

export async function GET() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.from("categories").select("*").order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map((c) => ({ id: c.id, name: c.name, image: c.image })));
}

export async function POST(request) {
  if (!isStaffRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!body.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("categories")
    .insert({ name: body.name, image: body.image || null })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id, name: data.name, image: data.image });
}
