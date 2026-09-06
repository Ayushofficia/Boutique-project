"use client";
import { useState } from "react";
import { inr } from "@/lib/constants";
import { Modal } from "@/components/UI";

export function SkuCard({ sku, onClick }) {
  return (
    <button onClick={onClick} className="sku-card card text-left overflow-hidden">
      <div style={{ aspectRatio: "3/4", overflow: "hidden" }}>
        <img src={sku.image} alt={sku.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <div className="text-[10px]" style={{ color: "var(--ink-soft)" }}>{sku.sku}</div>
        <div className="text-sm font-semibold leading-tight mt-0.5">{sku.name}</div>
        <div className="text-sm mt-1" style={{ color: "var(--maroon)" }}>{inr(sku.price)}</div>
      </div>
    </button>
  );
}

export function SkuModal({ sku, onClose, onEnquire }) {
  return (
    <Modal title={sku.name} onClose={onClose} wide>
      <div className="grid md:grid-cols-2 gap-6">
        <img src={sku.image} alt={sku.name} className="w-full object-cover" style={{ maxHeight: 420 }} />
        <div>
          <div className="text-xs" style={{ color: "var(--ink-soft)" }}>{sku.sku}</div>
          <div className="font-display text-2xl font-semibold mt-1" style={{ color: "var(--maroon)" }}>{inr(sku.price)}</div>
          <p className="text-sm mt-4" style={{ color: "var(--ink-soft)" }}>{sku.description}</p>
          <button onClick={onEnquire} className="btn btn-primary mt-6 w-full">Enquire about this design</button>
        </div>
      </div>
    </Modal>
  );
}
