"use client";
import { useEffect, useState } from "react";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { settingsApi, alterationsApi } from "@/lib/api";
import { inr } from "@/lib/constants";

export default function AlterationsPage() {
  const [settings, setSettings] = useState(null);
  const [alterations, setAlterations] = useState([]);

  useEffect(() => {
    settingsApi.get().then(setSettings).catch(() => {});
    alterationsApi.list().then(setAlterations).catch(() => {});
  }, []);

  const steps = [
    { title: "Bring it in, or book a pickup", text: "Drop your garment at the studio or ask us to collect it from home." },
    { title: "We measure and mark", text: "Our tailor checks fit against the body, not just the fabric." },
    { title: "Refit and finish", text: "Alterations are stitched with the same care as a new order." },
    { title: "Delivered back to you", text: "Collect in-store or have it delivered to your door." },
  ];

  return (
    <div>
      <PublicNav settings={settings} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <span className="label-script text-base">Refit, don&apos;t replace</span>
          <h1 className="font-display text-4xl font-semibold mt-1">Alterations, done properly</h1>
          <p className="text-sm mt-2 max-w-lg" style={{ color: "var(--ink-soft)" }}>Not just taken in or let out — refitted with the same care as a new stitch.</p>
          <div className="divider-gold mt-2"></div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-14">
          {steps.map((s, i) => (
            <div key={i}>
              <div className="font-display text-3xl font-semibold" style={{ color: "var(--gold)" }}>{String(i + 1).padStart(2, "0")}</div>
              <div className="text-sm font-semibold mt-2">{s.title}</div>
              <div className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>{s.text}</div>
            </div>
          ))}
        </div>

        <div className="mb-4"><h2 className="font-display text-2xl font-semibold">Indicative pricing</h2></div>
        <div className="card divide-y hairline">
          {alterations.map((a) => (
            <div key={a.id} className="flex items-center justify-between p-4">
              <div>
                <div className="text-sm font-semibold">{a.name}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>{a.description}</div>
              </div>
              <div className="text-sm font-semibold shrink-0 ml-4" style={{ color: "var(--maroon)" }}>{inr(a.price)}</div>
            </div>
          ))}
        </div>

        {settings && (
          <div className="text-center mt-10">
            <a href={"tel:" + settings.phone} className="btn btn-primary">Call to book an alteration</a>
          </div>
        )}
      </div>
      <PublicFooter settings={settings} />
    </div>
  );
}
