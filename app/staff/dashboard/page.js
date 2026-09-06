"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, ClipboardList, Package, Tag, Scissors, MessageCircle,
  Settings as SettingsIcon, Home as HomeIcon, LogOut, Plus, Trash2, Pencil,
  Printer, Search, Check, Upload,
} from "lucide-react";
import { Field, Modal, ConfirmDialog, Toast, useToast } from "@/components/UI";
import {
  authApi, settingsApi, catalogApi, alterationsApi, billsApi, enquiriesApi, uploadImage,
} from "@/lib/api";
import { MEASUREMENT_FIELDS, CUP_SIZES, ORDER_STATUSES, inr, uid } from "@/lib/constants";

export default function StaffDashboardPage() {
  const router = useRouter();
  const { toast, showToast } = useToast();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("overview");

  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [skus, setSkus] = useState([]);
  const [alterations, setAlterations] = useState([]);
  const [bills, setBills] = useState([]);
  const [enquiries, setEnquiries] = useState([]);

  const refreshCatalog = () => Promise.all([catalogApi.categories.list(), catalogApi.skus.list()]).then(([c, s]) => { setCategories(c); setSkus(s); });
  const refreshBills = () => billsApi.list().then(setBills);
  const refreshEnquiries = () => enquiriesApi.list().then(setEnquiries);
  const refreshAlterations = () => alterationsApi.list().then(setAlterations);
  const refreshSettings = () => settingsApi.get().then(setSettings);

  useEffect(() => {
    authApi.me().then((r) => {
      if (!r.authenticated) { router.replace("/staff"); return; }
      Promise.all([refreshSettings(), refreshCatalog(), refreshAlterations(), refreshBills(), refreshEnquiries()])
        .then(() => setReady(true))
        .catch(() => setReady(true));
    }).catch(() => router.replace("/staff"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => { await authApi.logout(); router.replace("/"); };

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "newbill", label: "New bill", icon: ClipboardList },
    { id: "orders", label: "Orders", icon: Package },
    { id: "catalog", label: "Catalog", icon: Tag },
    { id: "alterations", label: "Alterations", icon: Scissors },
    { id: "enquiries", label: "Enquiries", icon: MessageCircle },
    { id: "settings", label: "Site settings", icon: SettingsIcon },
  ];

  if (!ready) return <div className="min-h-screen flex items-center justify-center font-display text-lg" style={{ color: "var(--maroon)" }}>Loading console…</div>;

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: "var(--cream)" }}>
      <Toast toast={toast} />
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r hairline p-4" style={{ background: "#fff" }}>
        <div className="mb-6 px-2">
          <div className="font-display text-lg font-semibold" style={{ color: "var(--maroon)" }}>{settings.shopName}</div>
          <div className="text-[11px]" style={{ color: "var(--ink-soft)" }}>Management console</div>
        </div>
        <div className="flex flex-col gap-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={"sidebar-link " + (tab === t.id ? "active" : "")}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-1 pt-4 border-t hairline">
          <button onClick={() => router.push("/")} className="sidebar-link"><HomeIcon size={16} /> View website</button>
          <button onClick={logout} className="sidebar-link"><LogOut size={16} /> Log out</button>
        </div>
      </aside>

      <div className="md:hidden sticky top-0 z-30 bg-white border-b hairline px-3 py-2 flex gap-2 overflow-x-auto scrollbar-thin">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={"tab-pill shrink-0 flex items-center gap-1 " + (tab === t.id ? "active" : "")}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
        <button onClick={logout} className="tab-pill shrink-0 flex items-center gap-1"><LogOut size={13} /> Log out</button>
      </div>

      <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto">
        {tab === "overview" && <OverviewTab bills={bills} setTab={setTab} />}
        {tab === "newbill" && <NewBillTab skus={skus} categories={categories} refreshBills={refreshBills} showToast={showToast} />}
        {tab === "orders" && <OrdersTab bills={bills} refreshBills={refreshBills} showToast={showToast} />}
        {tab === "catalog" && <CatalogTab categories={categories} skus={skus} refreshCatalog={refreshCatalog} showToast={showToast} />}
        {tab === "alterations" && <AlterationsAdminTab alterations={alterations} refreshAlterations={refreshAlterations} showToast={showToast} />}
        {tab === "enquiries" && <EnquiriesTab enquiries={enquiries} refreshEnquiries={refreshEnquiries} showToast={showToast} />}
        {tab === "settings" && <SiteSettingsTab settings={settings} refreshSettings={refreshSettings} showToast={showToast} />}
      </main>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="card p-4">
      <div className="text-xs" style={{ color: "var(--ink-soft)" }}>{label}</div>
      <div className="font-display text-3xl font-semibold mt-1" style={{ color: accent || "var(--ink)" }}>{value}</div>
    </div>
  );
}

/* ---------- OVERVIEW ---------- */
function OverviewTab({ bills, setTab }) {
  const pending = bills.filter((b) => b.status !== "Delivered").length;
  const ready = bills.filter((b) => b.status === "Ready").length;
  const thisMonth = new Date().toISOString().slice(0, 7);
  const revenueThisMonth = bills.filter((b) => (b.date || "").slice(0, 7) === thisMonth).reduce((s, b) => s + Number(b.total || 0), 0);
  const recent = [...bills].sort((a, b) => (b.date > a.date ? 1 : -1)).slice(0, 6);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-6">Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total orders" value={bills.length} />
        <StatCard label="Pending / in progress" value={pending} accent="var(--maroon)" />
        <StatCard label="Ready for delivery" value={ready} accent="var(--gold)" />
        <StatCard label="Revenue this month" value={inr(revenueThisMonth)} accent="var(--maroon)" />
      </div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-xl font-semibold">Recent orders</h2>
        <button onClick={() => setTab("orders")} className="text-sm underline" style={{ color: "var(--maroon)" }}>View all</button>
      </div>
      {recent.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--ink-soft)" }}>No orders billed yet. Create your first bill from &quot;New bill&quot;.</p>
      ) : (
        <div className="card divide-y hairline">
          {recent.map((b) => (
            <div key={b.id} className="p-3 flex items-center justify-between text-sm">
              <div>
                <div className="font-semibold">{b.customer.name} <span className="font-normal" style={{ color: "var(--ink-soft)" }}>· {b.billNo}</span></div>
                <div className="text-xs" style={{ color: "var(--ink-soft)" }}>{b.date} · {b.status}</div>
              </div>
              <div className="font-semibold" style={{ color: "var(--maroon)" }}>{inr(b.total)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- NEW BILL ---------- */
function NewBillTab({ skus, categories, refreshBills, showToast }) {
  const emptyMeasurements = () => MEASUREMENT_FIELDS.reduce((acc, f) => { acc[f.key] = ""; return acc; }, {});
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [items, setItems] = useState([]);
  const [customItem, setCustomItem] = useState({ name: "", qty: 1, price: "" });
  const [measurements, setMeasurements] = useState(emptyMeasurements());
  const [cupSize, setCupSize] = useState("N/A");
  const [discount, setDiscount] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [notes, setNotes] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [saving, setSaving] = useState(false);

  const filteredSkus = catFilter === "all" ? skus : skus.filter((s) => s.categoryId === catFilter);

  const addSkuItem = (sku) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.skuId === sku.id);
      if (existing) return prev.map((i) => (i.skuId === sku.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: uid("it"), skuId: sku.id, name: sku.name, price: sku.price, qty: 1 }];
    });
  };
  const changeQty = (id, delta) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)));
  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const addCustomItem = () => {
    if (!customItem.name.trim() || !customItem.price) { showToast("Add a name and price for the custom item."); return; }
    setItems((prev) => [...prev, { id: uid("it"), skuId: null, name: customItem.name, price: Number(customItem.price), qty: Number(customItem.qty) || 1 }]);
    setCustomItem({ name: "", qty: 1, price: "" });
  };

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = Math.max(0, subtotal - Number(discount || 0));
  const balance = Math.max(0, total - Number(advance || 0));

  const resetForm = () => {
    setCustomer({ name: "", phone: "", address: "" }); setExpectedDelivery(""); setItems([]);
    setMeasurements(emptyMeasurements()); setCupSize("N/A"); setDiscount(0); setAdvance(0); setNotes("");
  };

  const saveBill = async () => {
    if (!customer.name.trim() || !customer.phone.trim()) { showToast("Customer name and phone are required."); return; }
    if (items.length === 0) { showToast("Add at least one item to the bill."); return; }
    setSaving(true);
    try {
      const bill = await billsApi.create({
        customer, expectedDelivery, items, measurements: { ...measurements, cupSize },
        subtotal, discount: Number(discount || 0), advance: Number(advance || 0), total, balance, notes,
      });
      await refreshBills();
      showToast("Bill " + bill.billNo + " saved.");
      window.open("/print/" + bill.id, "_blank");
      resetForm();
    } catch (err) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-6">New bill</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card p-4">
            <h2 className="font-display text-xl font-semibold mb-4">Customer details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Customer name"><input className="input-field" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} /></Field>
              <Field label="Phone number"><input className="input-field" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} /></Field>
              <Field label="Address"><textarea className="input-field" rows={2} value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} /></Field>
              <Field label="Expected delivery date"><input type="date" className="input-field" value={expectedDelivery} onChange={(e) => setExpectedDelivery(e.target.value)} /></Field>
            </div>
          </div>

          <div className="card p-4">
            <h2 className="font-display text-xl font-semibold mb-4">Add items from catalog</h2>
            <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-2 mb-3">
              <button onClick={() => setCatFilter("all")} className={"tab-pill shrink-0 " + (catFilter === "all" ? "active" : "")}>All</button>
              {categories.map((c) => <button key={c.id} onClick={() => setCatFilter(c.id)} className={"tab-pill shrink-0 " + (catFilter === c.id ? "active" : "")}>{c.name}</button>)}
            </div>
            <div className="grid sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto scrollbar-thin">
              {filteredSkus.map((sku) => (
                <button key={sku.id} onClick={() => addSkuItem(sku)} className="flex items-center gap-3 p-2 border hairline text-left hover:bg-blush" style={{ borderRadius: 2 }}>
                  <img src={sku.image} className="w-12 h-14 object-cover shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs truncate font-semibold">{sku.name}</div>
                    <div className="text-[11px]" style={{ color: "var(--ink-soft)" }}>{sku.sku} · {inr(sku.price)}</div>
                  </div>
                  <Plus size={16} style={{ color: "var(--maroon)" }} className="shrink-0" />
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t hairline">
              <h3 className="text-sm font-semibold mb-2">Add a custom stitching item</h3>
              <div className="grid sm:grid-cols-4 gap-2">
                <input className="input-field sm:col-span-2" placeholder="Item name" value={customItem.name} onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })} />
                <input type="number" min="1" className="input-field" placeholder="Qty" value={customItem.qty} onChange={(e) => setCustomItem({ ...customItem, qty: e.target.value })} />
                <input type="number" className="input-field" placeholder="Price ₹" value={customItem.price} onChange={(e) => setCustomItem({ ...customItem, price: e.target.value })} />
              </div>
              <button onClick={addCustomItem} className="btn btn-outline btn-sm mt-2"><Plus size={14} /> Add item</button>
            </div>
          </div>

          <div className="card p-4">
            <h2 className="font-display text-xl font-semibold mb-4">Measurements (inches)</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {MEASUREMENT_FIELDS.map((f) => (
                <Field key={f.key} label={f.label}>
                  <input type="number" step="0.25" className="input-field" value={measurements[f.key]} onChange={(e) => setMeasurements({ ...measurements, [f.key]: e.target.value })} />
                </Field>
              ))}
              <Field label="Cup size">
                <select className="input-field" value={cupSize} onChange={(e) => setCupSize(e.target.value)}>
                  {CUP_SIZES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Special instructions"><textarea className="input-field" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Fitting preference, style changes, fabric notes..." /></Field>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card p-4 sticky top-4">
            <h2 className="font-display text-xl font-semibold mb-3">Bill summary</h2>
            {items.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--ink-soft)" }}>No items added yet.</p>
            ) : (
              <div className="flex flex-col gap-2 mb-3">
                {items.map((i) => (
                  <div key={i.id} className="flex items-center gap-2 text-xs">
                    <div className="flex-1 truncate">{i.name}</div>
                    <button onClick={() => changeQty(i.id, -1)} className="btn btn-ghost btn-sm px-2">-</button>
                    <span>{i.qty}</span>
                    <button onClick={() => changeQty(i.id, 1)} className="btn btn-ghost btn-sm px-2">+</button>
                    <div className="w-16 text-right shrink-0">{inr(i.price * i.qty)}</div>
                    <button onClick={() => removeItem(i.id)}><Trash2 size={14} style={{ color: "#a4302f" }} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t hairline pt-3 flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span style={{ color: "var(--ink-soft)" }}>Subtotal</span><span>{inr(subtotal)}</span></div>
              <div className="flex justify-between items-center"><span style={{ color: "var(--ink-soft)" }}>Discount</span><input type="number" className="input-field w-24 text-right" value={discount} onChange={(e) => setDiscount(e.target.value)} /></div>
              <div className="flex justify-between font-semibold"><span>Total</span><span style={{ color: "var(--maroon)" }}>{inr(total)}</span></div>
              <div className="flex justify-between items-center"><span style={{ color: "var(--ink-soft)" }}>Advance paid</span><input type="number" className="input-field w-24 text-right" value={advance} onChange={(e) => setAdvance(e.target.value)} /></div>
              <div className="flex justify-between font-semibold"><span>Balance due</span><span>{inr(balance)}</span></div>
            </div>
            <button disabled={saving} onClick={saveBill} className="btn btn-primary w-full mt-4"><Printer size={16} /> {saving ? "Saving..." : "Save & print bill"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- ORDERS ---------- */
function OrdersTab({ bills, refreshBills, showToast }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toDelete, setToDelete] = useState(null);

  const list = bills.filter((b) => {
    const matchesSearch = !search || (b.customer.name + b.customer.phone + b.billNo).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id, status) => { await billsApi.update(id, { status }); await refreshBills(); };
  const doDelete = async () => { await billsApi.remove(toDelete); await refreshBills(); showToast("Order deleted."); setToDelete(null); };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-6">Order summary</h1>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--ink-soft)" }} />
          <input className="input-field pl-9" placeholder="Search name, phone or bill no." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-field sm:w-52" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {list.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--ink-soft)" }}>No orders match yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((b) => (
            <div key={b.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{b.customer.name} <span className="font-normal text-xs" style={{ color: "var(--ink-soft)" }}>· {b.billNo}</span></div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>{b.customer.phone} · {b.customer.address}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>Billed {b.date} · Expected delivery {b.expectedDelivery || "—"}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold" style={{ color: "var(--maroon)" }}>{inr(b.total)}</div>
                  <div className="text-xs" style={{ color: "var(--ink-soft)" }}>Balance {inr(b.balance)}</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <select className="input-field w-auto" value={b.status} onChange={(e) => updateStatus(b.id, e.target.value)}>
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <a href={"/print/" + b.id} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm"><Printer size={14} /> Print</a>
                <button onClick={() => setToDelete(b.id)} className="btn btn-danger btn-sm"><Trash2 size={14} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {toDelete && <ConfirmDialog text="This will permanently delete the order and its measurements. Continue?" onConfirm={doDelete} onCancel={() => setToDelete(null)} />}
    </div>
  );
}

/* ---------- CATALOG ---------- */
function ImageUploadField({ value, onChange, showToast }) {
  const [uploading, setUploading] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      showToast(err.message);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="flex gap-2">
      <input className="input-field" placeholder="Image URL, or upload a photo" value={value} onChange={(e) => onChange(e.target.value)} />
      <label className="btn btn-outline btn-sm shrink-0 cursor-pointer">
        <Upload size={13} /> {uploading ? "..." : "Upload"}
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
    </div>
  );
}

function CatalogTab({ categories, skus, refreshCatalog, showToast }) {
  const [newCat, setNewCat] = useState({ name: "", image: "" });
  const [editingCat, setEditingCat] = useState(null);
  const [newSku, setNewSku] = useState({ sku: "", name: "", categoryId: categories[0]?.id || "", price: "", image: "", description: "", trending: false });
  const [editingSku, setEditingSku] = useState(null);
  const [catToDelete, setCatToDelete] = useState(null);
  const [skuToDelete, setSkuToDelete] = useState(null);
  const [filterCat, setFilterCat] = useState("all");

  const addCategory = async () => {
    if (!newCat.name.trim()) { showToast("Give the category a name."); return; }
    await catalogApi.categories.create(newCat);
    await refreshCatalog();
    setNewCat({ name: "", image: "" });
  };
  const updateCategory = async () => { await catalogApi.categories.update(editingCat.id, editingCat); await refreshCatalog(); setEditingCat(null); };
  const deleteCategory = async () => { await catalogApi.categories.remove(catToDelete); await refreshCatalog(); showToast("Category and its designs removed."); setCatToDelete(null); };

  const addSku = async () => {
    if (!newSku.name.trim() || !newSku.price || !newSku.categoryId) { showToast("Name, price and category are required."); return; }
    await catalogApi.skus.create(newSku);
    await refreshCatalog();
    setNewSku({ sku: "", name: "", categoryId: categories[0]?.id || "", price: "", image: "", description: "", trending: false });
  };
  const updateSku = async () => { await catalogApi.skus.update(editingSku.id, editingSku); await refreshCatalog(); setEditingSku(null); };
  const deleteSku = async () => { await catalogApi.skus.remove(skuToDelete); await refreshCatalog(); showToast("Design removed."); setSkuToDelete(null); };

  const filteredSkus = filterCat === "all" ? skus : skus.filter((s) => s.categoryId === filterCat);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-6">Catalog management</h1>

      <div className="card p-4 mb-8">
        <h2 className="font-display text-xl font-semibold mb-4">Categories</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2 border hairline p-2">
              <img src={cat.image} className="w-10 h-12 object-cover shrink-0" alt="" />
              <div className="flex-1 min-w-0 text-xs font-semibold truncate">{cat.name}</div>
              <button onClick={() => setEditingCat(cat)} className="btn btn-ghost btn-sm px-2"><Pencil size={13} /></button>
              <button onClick={() => setCatToDelete(cat.id)} className="btn btn-ghost btn-sm px-2"><Trash2 size={13} style={{ color: "#a4302f" }} /></button>
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          <input className="input-field" placeholder="New category name" value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} />
          <ImageUploadField value={newCat.image} onChange={(v) => setNewCat({ ...newCat, image: v })} showToast={showToast} />
        </div>
        <button onClick={addCategory} className="btn btn-primary mt-3"><Plus size={14} /> Add category</button>
      </div>

      <div className="card p-4 mb-8">
        <h2 className="font-display text-xl font-semibold mb-4">Add a new design (SKU)</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          <Field label="SKU code (optional)"><input className="input-field" value={newSku.sku} onChange={(e) => setNewSku({ ...newSku, sku: e.target.value })} /></Field>
          <Field label="Design name"><input className="input-field" value={newSku.name} onChange={(e) => setNewSku({ ...newSku, name: e.target.value })} /></Field>
          <Field label="Category">
            <select className="input-field" value={newSku.categoryId} onChange={(e) => setNewSku({ ...newSku, categoryId: e.target.value })}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Price (₹)"><input type="number" className="input-field" value={newSku.price} onChange={(e) => setNewSku({ ...newSku, price: e.target.value })} /></Field>
          <div className="sm:col-span-2">
            <Field label="Photo"><ImageUploadField value={newSku.image} onChange={(v) => setNewSku({ ...newSku, image: v })} showToast={showToast} /></Field>
          </div>
          <Field label="Mark as trending">
            <select className="input-field" value={newSku.trending ? "yes" : "no"} onChange={(e) => setNewSku({ ...newSku, trending: e.target.value === "yes" })}>
              <option value="no">No</option><option value="yes">Yes</option>
            </select>
          </Field>
          <div className="sm:col-span-2 md:col-span-3">
            <Field label="Description"><textarea className="input-field" rows={2} value={newSku.description} onChange={(e) => setNewSku({ ...newSku, description: e.target.value })} /></Field>
          </div>
        </div>
        <button onClick={addSku} className="btn btn-primary mt-3"><Plus size={14} /> Add design</button>
        <p className="text-[11px] mt-2" style={{ color: "var(--ink-soft)" }}>Upload a photo directly, or paste an image link. Leave blank and a placeholder photo will be used until you update it.</p>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-xl font-semibold">All designs ({filteredSkus.length})</h2>
        <select className="input-field w-auto" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredSkus.map((sku) => (
          <div key={sku.id} className="card p-3">
            <img src={sku.image} className="w-full object-cover mb-2" style={{ aspectRatio: "3/4" }} alt="" />
            <div className="text-xs" style={{ color: "var(--ink-soft)" }}>{sku.sku}</div>
            <div className="text-sm font-semibold">{sku.name}</div>
            <div className="text-sm" style={{ color: "var(--maroon)" }}>{inr(sku.price)}</div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setEditingSku(sku)} className="btn btn-outline btn-sm flex-1"><Pencil size={13} /> Edit</button>
              <button onClick={() => setSkuToDelete(sku.id)} className="btn btn-danger btn-sm flex-1"><Trash2 size={13} /> Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editingCat && (
        <Modal title="Edit category" onClose={() => setEditingCat(null)}>
          <div className="flex flex-col gap-3">
            <Field label="Name"><input className="input-field" value={editingCat.name} onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })} /></Field>
            <Field label="Photo"><ImageUploadField value={editingCat.image} onChange={(v) => setEditingCat({ ...editingCat, image: v })} showToast={showToast} /></Field>
            <button onClick={updateCategory} className="btn btn-primary">Save changes</button>
          </div>
        </Modal>
      )}

      {editingSku && (
        <Modal title="Edit design" onClose={() => setEditingSku(null)} wide>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="SKU code"><input className="input-field" value={editingSku.sku} onChange={(e) => setEditingSku({ ...editingSku, sku: e.target.value })} /></Field>
            <Field label="Name"><input className="input-field" value={editingSku.name} onChange={(e) => setEditingSku({ ...editingSku, name: e.target.value })} /></Field>
            <Field label="Category">
              <select className="input-field" value={editingSku.categoryId} onChange={(e) => setEditingSku({ ...editingSku, categoryId: e.target.value })}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Price (₹)"><input type="number" className="input-field" value={editingSku.price} onChange={(e) => setEditingSku({ ...editingSku, price: Number(e.target.value) })} /></Field>
            <div className="sm:col-span-2">
              <Field label="Photo"><ImageUploadField value={editingSku.image} onChange={(v) => setEditingSku({ ...editingSku, image: v })} showToast={showToast} /></Field>
            </div>
            <Field label="Trending">
              <select className="input-field" value={editingSku.trending ? "yes" : "no"} onChange={(e) => setEditingSku({ ...editingSku, trending: e.target.value === "yes" })}>
                <option value="no">No</option><option value="yes">Yes</option>
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description"><textarea className="input-field" rows={2} value={editingSku.description} onChange={(e) => setEditingSku({ ...editingSku, description: e.target.value })} /></Field>
            </div>
          </div>
          <button onClick={updateSku} className="btn btn-primary mt-4">Save changes</button>
        </Modal>
      )}

      {catToDelete && <ConfirmDialog text="Deleting this category also removes every design inside it. Continue?" onConfirm={deleteCategory} onCancel={() => setCatToDelete(null)} />}
      {skuToDelete && <ConfirmDialog text="This design will be permanently removed from the website." onConfirm={deleteSku} onCancel={() => setSkuToDelete(null)} />}
    </div>
  );
}

/* ---------- ALTERATIONS ADMIN ---------- */
function AlterationsAdminTab({ alterations, refreshAlterations, showToast }) {
  const [newAlt, setNewAlt] = useState({ name: "", price: "", description: "" });
  const [editingAlt, setEditingAlt] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const add = async () => {
    if (!newAlt.name.trim() || !newAlt.price) { showToast("Name and price required."); return; }
    await alterationsApi.create(newAlt);
    await refreshAlterations();
    setNewAlt({ name: "", price: "", description: "" });
  };
  const update = async () => { await alterationsApi.update(editingAlt.id, editingAlt); await refreshAlterations(); setEditingAlt(null); };
  const del = async () => { await alterationsApi.remove(toDelete); await refreshAlterations(); setToDelete(null); showToast("Service removed."); };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-6">Alteration services</h1>
      <div className="card p-4 mb-6">
        <h2 className="font-display text-xl font-semibold mb-4">Add a service</h2>
        <div className="grid sm:grid-cols-3 gap-2">
          <input className="input-field" placeholder="Service name" value={newAlt.name} onChange={(e) => setNewAlt({ ...newAlt, name: e.target.value })} />
          <input type="number" className="input-field" placeholder="Price ₹" value={newAlt.price} onChange={(e) => setNewAlt({ ...newAlt, price: e.target.value })} />
          <input className="input-field" placeholder="Short description" value={newAlt.description} onChange={(e) => setNewAlt({ ...newAlt, description: e.target.value })} />
        </div>
        <button onClick={add} className="btn btn-primary mt-3"><Plus size={14} /> Add service</button>
      </div>
      <div className="card divide-y hairline">
        {alterations.map((a) => (
          <div key={a.id} className="flex items-center justify-between p-3">
            <div>
              <div className="text-sm font-semibold">{a.name}</div>
              <div className="text-xs" style={{ color: "var(--ink-soft)" }}>{a.description}</div>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-3">
              <span className="text-sm font-semibold" style={{ color: "var(--maroon)" }}>{inr(a.price)}</span>
              <button onClick={() => setEditingAlt(a)} className="btn btn-ghost btn-sm px-2"><Pencil size={13} /></button>
              <button onClick={() => setToDelete(a.id)} className="btn btn-ghost btn-sm px-2"><Trash2 size={13} style={{ color: "#a4302f" }} /></button>
            </div>
          </div>
        ))}
      </div>
      {editingAlt && (
        <Modal title="Edit service" onClose={() => setEditingAlt(null)}>
          <div className="flex flex-col gap-3">
            <Field label="Name"><input className="input-field" value={editingAlt.name} onChange={(e) => setEditingAlt({ ...editingAlt, name: e.target.value })} /></Field>
            <Field label="Price (₹)"><input type="number" className="input-field" value={editingAlt.price} onChange={(e) => setEditingAlt({ ...editingAlt, price: Number(e.target.value) })} /></Field>
            <Field label="Description"><textarea className="input-field" rows={2} value={editingAlt.description} onChange={(e) => setEditingAlt({ ...editingAlt, description: e.target.value })} /></Field>
            <button onClick={update} className="btn btn-primary">Save changes</button>
          </div>
        </Modal>
      )}
      {toDelete && <ConfirmDialog text="Remove this alteration service?" onConfirm={del} onCancel={() => setToDelete(null)} />}
    </div>
  );
}

/* ---------- ENQUIRIES ---------- */
function EnquiriesTab({ enquiries, refreshEnquiries, showToast }) {
  const [toDelete, setToDelete] = useState(null);
  const toggleHandled = async (e) => { await enquiriesApi.update(e.id, { handled: !e.handled }); await refreshEnquiries(); };
  const del = async () => { await enquiriesApi.remove(toDelete); await refreshEnquiries(); setToDelete(null); showToast("Enquiry removed."); };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-6">Website enquiries</h1>
      {enquiries.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--ink-soft)" }}>No enquiries submitted from the website yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {enquiries.map((e) => (
            <div key={e.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{e.name} <span className="text-xs font-normal" style={{ color: "var(--ink-soft)" }}>· {e.phone}</span></div>
                  <div className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>{e.message}</div>
                  <div className="text-[11px] mt-1" style={{ color: "var(--ink-soft)" }}>{e.date}</div>
                </div>
                <span className="text-[11px] px-2 py-1 shrink-0" style={{ background: e.handled ? "#e4f3e6" : "var(--blush)", color: e.handled ? "#2b7a3d" : "var(--maroon-dark)" }}>{e.handled ? "Handled" : "New"}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => toggleHandled(e)} className="btn btn-outline btn-sm"><Check size={13} /> {e.handled ? "Mark as new" : "Mark handled"}</button>
                <button onClick={() => setToDelete(e.id)} className="btn btn-danger btn-sm"><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {toDelete && <ConfirmDialog text="Delete this enquiry?" onConfirm={del} onCancel={() => setToDelete(null)} />}
    </div>
  );
}

/* ---------- SITE SETTINGS ---------- */
function SiteSettingsTab({ settings, refreshSettings, showToast }) {
  const [form, setForm] = useState(settings);
  const [newPin, setNewPin] = useState("");

  const save = async () => {
    const payload = { ...form };
    if (newPin.trim()) {
      if (!/^\d{4,6}$/.test(newPin.trim())) { showToast("PIN must be 4–6 digits."); return; }
      payload.staffPin = newPin.trim();
    }
    try {
      await settingsApi.update(payload);
      await refreshSettings();
      setNewPin("");
      showToast("Site settings saved.");
    } catch (err) {
      showToast(err.message);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-6">Site settings</h1>
      <div className="card p-4 flex flex-col gap-4 max-w-2xl">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Shop name"><input className="input-field" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} /></Field>
          <Field label="Owner name"><input className="input-field" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} /></Field>
        </div>
        <Field label="Homepage tagline"><input className="input-field" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></Field>
        <Field label="Homepage subline"><textarea className="input-field" rows={2} value={form.subline} onChange={(e) => setForm({ ...form, subline: e.target.value })} /></Field>
        <Field label="Hero photo"><ImageUploadField value={form.heroImage} onChange={(v) => setForm({ ...form, heroImage: v })} showToast={showToast} /></Field>
        {form.heroImage && <img src={form.heroImage} className="w-full max-h-56 object-cover" alt="" />}
        <Field label="Address"><textarea className="input-field" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Phone"><input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Email"><input className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Instagram handle"><input className="input-field" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} /></Field>
          <Field label="Facebook handle"><input className="input-field" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} /></Field>
        </div>
        <Field label="Opening hours"><input className="input-field" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} /></Field>
        <div className="border-t hairline pt-4">
          <Field label="Change staff PIN (leave blank to keep current)"><input className="input-field" maxLength={6} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))} placeholder="New 4–6 digit PIN" /></Field>
        </div>
        <button onClick={save} className="btn btn-primary self-start">Save settings</button>
      </div>
    </div>
  );
}
