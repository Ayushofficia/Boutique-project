"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Ruler, Home as HomeIcon, Package, Scissors, Star } from "lucide-react";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { SkuCard, SkuModal } from "@/components/Sku";
import { settingsApi, catalogApi } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [skus, setSkus] = useState([]);
  const [selectedSku, setSelectedSku] = useState(null);

  useEffect(() => {
    settingsApi.get().then(setSettings).catch(() => {});
    catalogApi.categories.list().then(setCategories).catch(() => {});
    catalogApi.skus.list().then(setSkus).catch(() => {});
  }, []);

  const trending = skus.filter((s) => s.trending).slice(0, 6);
  const featured = (trending.length ? trending : skus).slice(0, 6);

  const features = [
    { icon: Ruler, title: "Made-to-measure", text: "Every piece is cut to your exact measurements, not a size chart." },
    { icon: HomeIcon, title: "Home visits", text: "Our stylist measures you at your doorstep, anywhere in the city." },
    { icon: Package, title: "10-day turnaround", text: "From fabric to final fitting in ten days, guaranteed." },
    { icon: Scissors, title: "Alterations included", text: "One free alteration on every custom order." },
  ];
  const testimonials = [
    { quote: "Arti stitched my sister's bridal lehenga and it fit like it was made for her — because it was.", name: "Priya S." },
    { quote: "I sent my measurements once, and every kurta since has fit perfectly.", name: "Neha R." },
    { quote: "The alteration turnaround saved my cousin's wedding outfit two days before the event.", name: "Kavita M." },
  ];

  if (!settings) return <div className="min-h-[60vh] flex items-center justify-center font-display text-lg" style={{ color: "var(--maroon)" }}>Loading…</div>;

  return (
    <div>
      <PublicNav settings={settings} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <div className="grid md:grid-cols-2 gap-0 border hairline">
          <div className="relative order-2 md:order-1" style={{ minHeight: 360 }}>
            <img src={settings.heroImage} alt="Bespoke Indian ethnic wear" className="w-full h-full object-cover" style={{ minHeight: 360, maxHeight: 560 }} />
          </div>
          <div className="order-1 md:order-2 flex flex-col justify-center p-8 sm:p-12" style={{ background: "var(--blush)" }}>
            <span className="label-script text-lg mb-3">Tradition, tailored precisely</span>
            <h1 className="font-display text-4xl sm:text-5xl leading-tight font-semibold" style={{ color: "var(--maroon-dark)" }}>{settings.tagline}</h1>
            <p className="mt-4 text-base" style={{ color: "var(--ink-soft)" }}>{settings.subline}</p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link href="/contact" className="btn btn-primary">Book a fitting</Link>
              <Link href="/collection" className="btn btn-outline">View the collection</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <div key={i} className="flex flex-col items-start gap-3">
            <div className="flex items-center justify-center rounded-full" style={{ width: 44, height: 44, background: "var(--blush)" }}>
              <f.icon size={20} color="var(--maroon)" />
            </div>
            <div className="text-sm font-semibold">{f.title}</div>
            <div className="text-xs" style={{ color: "var(--ink-soft)" }}>{f.text}</div>
          </div>
        ))}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <span className="label-script text-base">Browse the edit</span>
          <h2 className="font-display text-3xl font-semibold mt-1">Shop by category</h2>
          <div className="divider-gold mt-2"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => router.push("/collection?category=" + cat.id)} className="relative overflow-hidden group text-left" style={{ aspectRatio: "3/4" }}>
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(43,33,31,0.75), rgba(43,33,31,0) 55%)" }}></div>
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <div className="font-display text-lg font-semibold">{cat.name}</div>
                <span className="text-xs underline underline-offset-2 opacity-90">Shop designs</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <span className="label-script text-base">Most requested</span>
          <h2 className="font-display text-3xl font-semibold mt-1">Loved by our clients</h2>
          <div className="divider-gold mt-2"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {featured.map((sku) => <SkuCard key={sku.id} sku={sku} onClick={() => setSelectedSku(sku)} />)}
        </div>
      </section>

      <section style={{ background: "var(--blush)" }} className="py-14 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <span className="label-script text-base">In their words</span>
            <h2 className="font-display text-3xl font-semibold mt-1">What clients say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="card p-6">
                <div className="flex gap-1 mb-3" style={{ color: "var(--gold)" }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="var(--gold)" />)}
                </div>
                <p className="text-sm italic" style={{ color: "var(--ink-soft)" }}>&ldquo;{t.quote}&rdquo;</p>
                <div className="text-sm font-semibold mt-4">{t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 sm:p-10" style={{ background: "var(--maroon)" }}>
          <div className="text-white text-center md:text-left">
            <h3 className="font-display text-2xl sm:text-3xl font-semibold">Need an alteration, not a new outfit?</h3>
            <p className="text-sm opacity-85 mt-1">We refit and repair too — see our alteration services.</p>
          </div>
          <Link href="/alterations" className="btn btn-white shrink-0">See alterations</Link>
        </div>
      </section>

      <PublicFooter settings={settings} />

      {selectedSku && (
        <SkuModal sku={selectedSku} onClose={() => setSelectedSku(null)}
          onEnquire={() => {
            const msg = "Hi, I'm interested in " + selectedSku.name + " (" + selectedSku.sku + ").";
            setSelectedSku(null);
            router.push("/contact?prefill=" + encodeURIComponent(msg));
          }} />
      )}
    </div>
  );
}
