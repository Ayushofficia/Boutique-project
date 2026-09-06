import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isStaffRequest } from "@/lib/auth";

export async function PUT(request, { params }) {
  if (!isStaffRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("skus")
    .update({
      sku: body.sku,
      name: body.name,
      category_id: body.categoryId,
      price: Number(body.price) || 0,
      image: body.image,
      description: body.description,
      trending: !!body.trending,
    })
    .eq("id", params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    id: data.id, sku: data.sku, name: data.name, categoryId: data.category_id,
    price: Number(data.price), image: data.image, description: data.description, trending: data.trending,
  });
}

export async function DELETE(request, { params }) {
  if (!isStaffRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = supabaseAdmin();
  const { error } = await supabase.from("skus").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
