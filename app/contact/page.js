"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { Field, Toast, useToast } from "@/components/UI";
import { settingsApi, enquiriesApi } from "@/lib/api";

function ContactInner() {
  const params = useSearchParams();
  const { toast, showToast } = useToast();
  const [settings, setSettings] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(params.get("prefill") || "");
  const [sent, setSent] = useState(false);

  useEffect(() => { settingsApi.get().then(setSettings).catch(() => {}); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) { showToast("Please add your name and phone number."); return; }
    try {
      await enquiriesApi.create({ name, phone, message });
      setSent(true);
      setName(""); setPhone(""); setMessage("");
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      showToast(err.message);
    }
  };

  const mapsUrl = settings ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(settings.address) : "#";

  return (
    <div>
      <PublicNav settings={settings} />
      <Toast toast={toast} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <span className="label-script text-base">We&apos;d love to meet you</span>
          <h1 className="font-display text-4xl font-semibold mt-1">Visit the studio</h1>
          <p className="text-sm mt-2 max-w-lg" style={{ color: "var(--ink-soft)" }}>Or send your measurements and let us come to you.</p>
          <div className="divider-gold mt-2"></div>
        </div>

        {settings && (
          <div className="grid md:grid-cols-2 gap-10">
            <div className="card p-6">
              <div className="flex items-start gap-3 mb-4"><MapPin size={18} style={{ color: "var(--maroon)" }} className="shrink-0 mt-0.5" /> <span className="text-sm">{settings.address}</span></div>
              <div className="flex items-center gap-3 mb-4"><Phone size={18} style={{ color: "var(--maroon)" }} /> <a href={"tel:" + settings.phone} className="text-sm">{settings.phone}</a></div>
              <div className="flex items-center gap-3 mb-4"><Mail size={18} style={{ color: "var(--maroon)" }} /> <a href={"mailto:" + settings.email} className="text-sm">{settings.email}</a></div>
              <div className="flex items-center gap-3 mb-6"><MessageCircle size={18} style={{ color: "var(--maroon)" }} /> <span className="text-sm">{settings.hours}</span></div>
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn btn-outline w-full">Get directions</a>
            </div>

            <form onSubmit={submit} className="card p-6 flex flex-col gap-4">
              {sent && <div className="text-sm p-3" style={{ background: "var(--blush)", color: "var(--maroon-dark)" }}>Thanks — we&apos;ll get back to you within 24 hours.</div>}
              <Field label="Your name"><input className="input-field" value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Field label="Phone number"><input className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
              <Field label="Message"><textarea className="input-field" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us about the design or alteration you need..." /></Field>
              <button type="submit" className="btn btn-primary">Send enquiry</button>
            </form>
          </div>
        )}
      </div>
      <PublicFooter settings={settings} />
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactInner />
    </Suspense>
  );
}
