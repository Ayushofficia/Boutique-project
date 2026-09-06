export const MEASUREMENT_FIELDS = [
  { key: "chestBust", label: "Chest / Bust" },
  { key: "waist", label: "Waist" },
  { key: "hip", label: "Hip" },
  { key: "shoulder", label: "Shoulder" },
  { key: "acrossBack", label: "Across back" },
  { key: "armhole", label: "Armhole round" },
  { key: "sleeveLength", label: "Sleeve / hand length" },
  { key: "sleeveRound", label: "Sleeve round (bicep)" },
  { key: "wristRound", label: "Wrist round" },
  { key: "frontNeckDepth", label: "Front neck depth" },
  { key: "backNeckDepth", label: "Back neck depth" },
  { key: "topLength", label: "Blouse / top length" },
  { key: "waistToKnee", label: "Waist to knee" },
  { key: "fullLength", label: "Full length (waist to ankle)" },
  { key: "thighRound", label: "Thigh round" },
  { key: "calfRound", label: "Calf round" },
  { key: "ankleRound", label: "Ankle round" },
  { key: "neckRound", label: "Neck round" },
];

export const CUP_SIZES = ["N/A", "AA", "A", "B", "C", "D", "DD"];
export const ORDER_STATUSES = ["Pending", "Cutting", "Stitching", "Ready", "Delivered"];

export const uid = (p) => p + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
export const todayISO = () => new Date().toISOString().slice(0, 10);

export function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
