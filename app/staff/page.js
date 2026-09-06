"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { authApi } from "@/lib/api";

export default function StaffLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    authApi.me().then((r) => {
      if (r.authenticated) router.replace("/staff/dashboard");
      else setChecking(false);
    }).catch(() => setChecking(false));
  }, [router]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await authApi.login(pin);
      router.replace("/staff/dashboard");
    } catch (err) {
      setError(err.message || "Incorrect PIN. Please try again.");
    }
  };

  if (checking) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--cream)" }}>
      <form onSubmit={submit} className="card p-8 w-full max-w-sm text-center">
        <div className="flex items-center justify-center rounded-full mx-auto mb-4" style={{ width: 52, height: 52, background: "var(--blush)" }}>
          <Lock size={22} style={{ color: "var(--maroon)" }} />
        </div>
        <h1 className="font-display text-2xl font-semibold">Staff & owner access</h1>
        <p className="text-xs mt-1 mb-5" style={{ color: "var(--ink-soft)" }}>Enter the boutique PIN to open billing and management.</p>
        <input autoFocus className="input-field text-center tracking-[0.4em] text-lg" maxLength={6} value={pin}
          onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setError(""); }} placeholder="••••" />
        {error && <p className="text-xs mt-2" style={{ color: "#a4302f" }}>{error}</p>}
        <button type="submit" className="btn btn-primary w-full mt-5">Enter</button>
        <Link href="/" className="btn btn-ghost w-full mt-2">Back to website</Link>
        <p className="text-[11px] mt-4" style={{ color: "var(--ink-soft)" }}>Default PIN is 1234 — change it under Site Settings once inside.</p>
      </form>
    </div>
  );
}
