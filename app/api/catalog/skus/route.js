import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isStaffRequest } from "@/lib/auth";

function toClient(row) {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    categoryId: row.category_id,
    price: Number(row.price),
    image: row.image,
    description: row.description,
    trending: row.trending,
  };
}

export async function GET() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.from("skus").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(toClient));
}

export async function POST(request) {
  if (!isStaffRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!body.name || !body.categoryId) {
    return NextResponse.json({ error: "Name and category are required" }, { status: 400 });
  }
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("skus")
    .insert({
      sku: body.sku || "AOL-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      name: body.name,
      category_id: body.categoryId,
      price: Number(body.price) || 0,
      image: body.image || null,
      description: body.description || "",
      trending: !!body.trending,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toClient(data));
}
