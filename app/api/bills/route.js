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

export async function GET(request) {
  if (!isStaffRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.from("bills").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(toClient));
}

export async function POST(request) {
  if (!isStaffRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!body.customer || !body.customer.name || !body.customer.phone) {
    return NextResponse.json({ error: "Customer name and phone are required" }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "At least one bill item is required" }, { status: 400 });
  }
  const supabase = supabaseAdmin();

  const { data: billNoData, error: billNoErr } = await supabase.rpc("next_bill_no");
  if (billNoErr) return NextResponse.json({ error: billNoErr.message }, { status: 500 });

  const { data, error } = await supabase
    .from("bills")
    .insert({
      bill_no: billNoData,
      bill_date: body.date || new Date().toISOString().slice(0, 10),
      status: "Pending",
      customer_name: body.customer.name,
      customer_phone: body.customer.phone,
      customer_address: body.customer.address || "",
      expected_delivery: body.expectedDelivery || null,
      items: body.items,
      measurements: body.measurements || {},
      subtotal: Number(body.subtotal) || 0,
      discount: Number(body.discount) || 0,
      advance: Number(body.advance) || 0,
      total: Number(body.total) || 0,
      balance: Number(body.balance) || 0,
      notes: body.notes || "",
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toClient(data));
}
