// Thin wrapper around fetch() so components don't repeat boilerplate.
// All calls include credentials so the httpOnly staff-session cookie is sent.

async function req(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;
  if (!res.ok) {
    throw new Error((data && data.error) || "Request failed (" + res.status + ")");
  }
  return data;
}

/* ---------- auth ---------- */
export const authApi = {
  login: (pin) => req("/api/auth/login", { method: "POST", body: JSON.stringify({ pin }) }),
  logout: () => req("/api/auth/logout", { method: "POST" }),
  me: () => req("/api/auth/me"),
};

/* ---------- settings ---------- */
export const settingsApi = {
  get: () => req("/api/settings"),
  update: (payload) => req("/api/settings", { method: "PUT", body: JSON.stringify(payload) }),
};

/* ---------- catalog ---------- */
export const catalogApi = {
  categories: {
    list: () => req("/api/catalog/categories"),
    create: (payload) => req("/api/catalog/categories", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) => req("/api/catalog/categories/" + id, { method: "PUT", body: JSON.stringify(payload) }),
    remove: (id) => req("/api/catalog/categories/" + id, { method: "DELETE" }),
  },
  skus: {
    list: () => req("/api/catalog/skus"),
    create: (payload) => req("/api/catalog/skus", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) => req("/api/catalog/skus/" + id, { method: "PUT", body: JSON.stringify(payload) }),
    remove: (id) => req("/api/catalog/skus/" + id, { method: "DELETE" }),
  },
};

/* ---------- alterations ---------- */
export const alterationsApi = {
  list: () => req("/api/alterations"),
  create: (payload) => req("/api/alterations", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => req("/api/alterations/" + id, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id) => req("/api/alterations/" + id, { method: "DELETE" }),
};

/* ---------- bills ---------- */
export const billsApi = {
  list: () => req("/api/bills"),
  get: (id) => req("/api/bills/" + id),
  create: (payload) => req("/api/bills", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => req("/api/bills/" + id, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id) => req("/api/bills/" + id, { method: "DELETE" }),
};

/* ---------- enquiries ---------- */
export const enquiriesApi = {
  list: () => req("/api/enquiries"),
  create: (payload) => req("/api/enquiries", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => req("/api/enquiries/" + id, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id) => req("/api/enquiries/" + id, { method: "DELETE" }),
};

/* ---------- image upload ---------- */
export async function uploadImage(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: form, credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url;
}
