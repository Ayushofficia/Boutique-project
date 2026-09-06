import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isStaffRequest } from "@/lib/auth";

export async function GET() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.from("alterations").select("*").order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map((a) => ({ id: a.id, name: a.name, price: Number(a.price), description: a.description })));
}

export async function POST(request) {
  if (!isStaffRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!body.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("alterations")
    .insert({ name: body.name, price: Number(body.price) || 0, description: body.description || "" })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id, name: data.name, price: Number(data.price), description: data.description });
}
