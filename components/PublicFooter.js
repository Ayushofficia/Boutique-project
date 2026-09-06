"use client";
import Link from "next/link";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";

export default function PublicFooter({ settings }) {
  if (!settings) return null;
  return (
    <footer style={{ background: "var(--maroon-dark)" }} className="text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="font-display text-2xl mb-2">{settings.shopName}</div>
          <p className="text-sm opacity-80">{settings.tagline}</p>
          <div className="flex gap-3 mt-4">
            <a href={"https://instagram.com/" + settings.instagram} className="opacity-80 hover:opacity-100"><Instagram size={18} /></a>
            <a href={"https://facebook.com/" + settings.facebook} className="opacity-80 hover:opacity-100"><Facebook size={18} /></a>
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3 opacity-90">Explore</div>
          <div className="flex flex-col gap-2 text-sm opacity-80">
            <Link href="/collection" className="hover:opacity-100">Collection</Link>
            <Link href="/alterations" className="hover:opacity-100">Alterations</Link>
            <Link href="/contact" className="hover:opacity-100">Contact</Link>
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3 opacity-90">Visit</div>
          <div className="flex flex-col gap-2 text-sm opacity-80">
            <span className="flex gap-2"><MapPin size={15} className="shrink-0 mt-0.5" /> {settings.address}</span>
            <span className="flex gap-2"><Phone size={15} /> {settings.phone}</span>
            <span className="flex gap-2"><Mail size={15} /> {settings.email}</span>
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3 opacity-90">Hours</div>
          <p className="text-sm opacity-80">{settings.hours}</p>
        </div>
      </div>
      <div className="border-t border-white/10 text-center text-xs opacity-60 py-4">
        © {new Date().getFullYear()} {settings.shopName} — {settings.ownerName} Boutique. All rights reserved.
      </div>
    </footer>
  );
}
