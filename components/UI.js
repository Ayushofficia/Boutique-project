"use client";
import { useRef, useState } from "react";
import { X } from "lucide-react";

export function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const showToast = (msg) => {
    setToast(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2600);
  };
  return { toast, showToast };
}

export function Field({ label, children }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(43,33,31,0.55)" }}>
      <div className={"card w-full " + (wide ? "max-w-3xl" : "max-w-md") + " max-h-[90vh] overflow-y-auto"}>
        <div className="flex items-center justify-between p-4 border-b hairline sticky top-0 bg-white z-10">
          <h3 className="text-xl font-display font-semibold">{title}</h3>
          <button onClick={onClose} className="btn btn-ghost btn-icon"><X size={18} /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ text, onConfirm, onCancel }) {
  return (
    <Modal title="Please confirm" onClose={onCancel}>
      <p className="text-sm mb-4" style={{ color: "var(--ink-soft)" }}>{text}</p>
      <div className="flex justify-end gap-2">
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
        <button className="btn btn-danger btn-sm" onClick={onConfirm}>Delete</button>
      </div>
    </Modal>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 text-sm text-white shadow-lg screen-only"
      style={{ background: "var(--maroon)", borderRadius: "4px" }}>
      {toast}
    </div>
  );
}
