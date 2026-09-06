"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import { authApi, billsApi, settingsApi } from "@/lib/api";
import { MEASUREMENT_FIELDS, inr, chunk } from "@/lib/constants";

export default function PrintBillPage() {
  const { id } = useParams();
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [bill, setBill] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    authApi.me().then((r) => {
      if (!r.authenticated) { router.replace("/staff"); return; }
      Promise.all([settingsApi.get(), billsApi.get(id)])
        .then(([s, b]) => { setSettings(s); setBill(b); setTimeout(() => window.print(), 400); })
        .catch((e) => setError(e.message));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (error) return <div className="p-8 text-center text-sm" style={{ color: "#a4302f" }}>{error}</div>;
  if (!settings || !bill) return <div className="p-8 text-center font-display" style={{ color: "var(--maroon)" }}>Loading bill…</div>;

  return (
    <div style={{ fontFamily: "Inter, sans-serif", color: "#1a1a1a", fontSize: "12px" }}>
      <div className="screen-only p-4 flex gap-2 border-b hairline">
        <button onClick={() => router.back()} className="btn btn-ghost btn-sm"><ArrowLeft size={14} /> Back</button>
        <button onClick={() => window.print()} className="btn btn-primary btn-sm"><Printer size={14} /> Print again</button>
      </div>
      <BillCopy settings={settings} bill={bill} copyLabel="Customer copy" showMeasurements={false} />
      <BillCopy settings={settings} bill={bill} copyLabel="Boutique copy" showMeasurements={true} />
      <style>{`
        @media print {
          .screen-only { display: none !important; }
          .bill-copy { page-break-after: always; }
          .bill-copy:last-child { page-break-after: auto; }
          @page { size: A4; margin: 12mm; }
        }
      `}</style>
    </div>
  );
}

function BillCopy({ settings, bill, copyLabel, showMeasurements }) {
  return (
    <div className="bill-copy" style={{ padding: "10mm" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #6E1E3A", paddingBottom: "8px" }}>
        <div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#6E1E3A" }}>{settings.shopName}</div>
          <div style={{ fontSize: "11px" }}>{settings.ownerName} Boutique</div>
          <div style={{ fontSize: "10px", marginTop: "4px" }}>{settings.address}</div>
          <div style={{ fontSize: "10px" }}>{settings.phone} · {settings.email}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase" }}>{copyLabel}</div>
          <div style={{ fontSize: "11px", marginTop: "4px" }}>Bill No: <b>{bill.billNo}</b></div>
          <div style={{ fontSize: "11px" }}>Date: {bill.date}</div>
          <div style={{ fontSize: "11px" }}>Expected delivery: {bill.expectedDelivery || "—"}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "11px" }}>Customer</div>
          <div style={{ fontSize: "11px" }}>{bill.customer.name}</div>
          <div style={{ fontSize: "11px" }}>{bill.customer.phone}</div>
          <div style={{ fontSize: "11px", maxWidth: "260px" }}>{bill.customer.address}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700, fontSize: "11px" }}>Status</div>
          <div style={{ fontSize: "11px" }}>{bill.status}</div>
        </div>
      </div>

      <table style={{ width: "100%", marginTop: "12px", borderCollapse: "collapse", fontSize: "11px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #ccc", borderTop: "1px solid #ccc" }}>
            <th style={{ textAlign: "left", padding: "4px 0" }}>Item</th>
            <th style={{ textAlign: "center", padding: "4px 0" }}>Qty</th>
            <th style={{ textAlign: "right", padding: "4px 0" }}>Price</th>
            <th style={{ textAlign: "right", padding: "4px 0" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((i) => (
            <tr key={i.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "4px 0" }}>{i.name}</td>
              <td style={{ textAlign: "center" }}>{i.qty}</td>
              <td style={{ textAlign: "right" }}>{inr(i.price)}</td>
              <td style={{ textAlign: "right" }}>{inr(i.price * i.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
        <table style={{ fontSize: "11px", width: "220px" }}>
          <tbody>
            <tr><td>Subtotal</td><td style={{ textAlign: "right" }}>{inr(bill.subtotal)}</td></tr>
            <tr><td>Discount</td><td style={{ textAlign: "right" }}>{inr(bill.discount)}</td></tr>
            <tr style={{ fontWeight: 700 }}><td>Total</td><td style={{ textAlign: "right" }}>{inr(bill.total)}</td></tr>
            <tr><td>Advance paid</td><td style={{ textAlign: "right" }}>{inr(bill.advance)}</td></tr>
            <tr style={{ fontWeight: 700 }}><td>Balance due</td><td style={{ textAlign: "right" }}>{inr(bill.balance)}</td></tr>
          </tbody>
        </table>
      </div>

      {bill.notes && <div style={{ marginTop: "8px", fontSize: "11px" }}><b>Notes:</b> {bill.notes}</div>}

      {showMeasurements && (
        <div style={{ marginTop: "14px", borderTop: "1px dashed #999", paddingTop: "10px" }}>
          <div style={{ fontWeight: 700, fontSize: "12px", marginBottom: "6px" }}>Measurements (inches)</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5px" }}>
            <tbody>
              {chunk(MEASUREMENT_FIELDS, 3).map((row, ri) => (
                <tr key={ri}>
                  {row.map((f) => <td key={f.key} style={{ padding: "3px 6px 3px 0", width: "33%" }}>{f.label}: <b>{bill.measurements[f.key] || "—"}</b></td>)}
                  {row.length < 3 && [...Array(3 - row.length)].map((_, k) => <td key={"pad" + k}></td>)}
                </tr>
              ))}
              <tr><td colSpan={3} style={{ padding: "3px 0" }}>Cup size: <b>{bill.measurements.cupSize || "N/A"}</b></td></tr>
            </tbody>
          </table>
        </div>
      )}

      {!showMeasurements && (
        <div style={{ marginTop: "16px", fontSize: "10.5px", color: "#555" }}>Thank you for choosing {settings.shopName}. Please bring this copy at the time of delivery.</div>
      )}
    </div>
  );
}
