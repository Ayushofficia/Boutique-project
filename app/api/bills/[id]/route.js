import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isStaffRequest } from "@/lib/auth";

function toClient(row) {
  return {
    id: row.id,
    billNo: row.bill_no,
    date: row.bill_date,
    status: row.status,
    customer: { name: row.customer_name, phone: row.customer_phone, address: row.customer_address },
    expectedDelivery: row.expected_delivery,
    items: row.items || [],
    measurements: row.measurements || {},
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    advance: Number(row.advance),
    total: Number(row.total),
    balance: Number(row.balance),
    notes: row.notes,
  };
}

export async function GET(request, { params }) {
  if (!isStaffRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.from("bills").select("*").eq("id", params.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(toClient(data));
}

export async function PUT(request, { params }) {
  if (!isStaffRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const supabase = supabaseAdmin();
  const update = {};
  if (body.status) update.status = body.status;
  const { data, error } = await supabase.from("bills").update(update).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toClient(data));
}

export async function DELETE(request, { params }) {
  if (!isStaffRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = supabaseAdmin();
  const { error } = await supabase.from("bills").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
