"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Phone, Lock } from "lucide-react";

export default function PublicNav({ settings }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/", label: "Home" },
    { href: "/collection", label: "Collection" },
    { href: "/alterations", label: "Alterations" },
    { href: "/contact", label: "Contact" },
  ];
  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 bg-white border-b hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-left">
          <div className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: "var(--maroon)" }}>
            <span className="font-display text-white text-lg">A</span>
          </div>
          <div>
            <div className="font-display text-lg font-semibold leading-none" style={{ color: "var(--maroon)" }}>{settings?.shopName || "The Art of Lifestyle"}</div>
            <div className="text-[11px] tracking-wide" style={{ color: "var(--ink-soft)" }}>by {settings?.ownerName || "Arti"} Boutique</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={"nav-link text-sm " + (isActive(l.href) ? "active" : "")}>{l.label}</Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a href={"tel:" + (settings?.phone || "")} className="btn btn-outline btn-sm"><Phone size={14} /> Call</a>
          <Link href="/staff" className="btn btn-ghost btn-icon" title="Staff & owner login"><Lock size={16} /></Link>
        </div>

        <button className="md:hidden btn btn-ghost btn-icon" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t hairline px-4 pb-4 flex flex-col gap-1 bg-white">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-left py-2 text-sm font-medium" style={{ color: isActive(l.href) ? "var(--maroon)" : "var(--ink)" }}>{l.label}</Link>
          ))}
          <a href={"tel:" + (settings?.phone || "")} className="btn btn-outline btn-sm mt-2 justify-center"><Phone size={14} /> Call the boutique</a>
          <Link href="/staff" className="btn btn-ghost btn-sm mt-2 justify-center"><Lock size={14} /> Staff & owner login</Link>
        </div>
      )}
    </header>
  );
}
