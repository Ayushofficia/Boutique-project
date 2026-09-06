"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { SkuCard, SkuModal } from "@/components/Sku";
import { settingsApi, catalogApi } from "@/lib/api";

function CollectionInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [skus, setSkus] = useState([]);
  const [filter, setFilter] = useState(params.get("category") || "all");
  const [selectedSku, setSelectedSku] = useState(null);

  useEffect(() => {
    settingsApi.get().then(setSettings).catch(() => {});
    catalogApi.categories.list().then(setCategories).catch(() => {});
    catalogApi.skus.list().then(setSkus).catch(() => {});
  }, []);

  const filtered = filter === "all" ? skus : skus.filter((s) => s.categoryId === filter);

  return (
    <div>
      <PublicNav settings={settings} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <span className="label-script text-base">Full collection</span>
          <h1 className="font-display text-4xl font-semibold mt-1">Our designs</h1>
          <div className="divider-gold mt-2"></div>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-2 mb-6">
          <button onClick={() => setFilter("all")} className={"tab-pill shrink-0 " + (filter === "all" ? "active" : "")}>All</button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setFilter(c.id)} className={"tab-pill shrink-0 " + (filter === c.id ? "active" : "")}>{c.name}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--ink-soft)" }}>No designs in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((sku) => <SkuCard key={sku.id} sku={sku} onClick={() => setSelectedSku(sku)} />)}
          </div>
        )}
      </div>
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

export default function CollectionPage() {
  return (
    <Suspense fallback={null}>
      <CollectionInner />
    </Suspense>
  );
}
