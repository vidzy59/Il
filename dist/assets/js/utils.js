/* Utilitas format dan DOM. */
export const fmtIDR = (n) =>
  "Rp " + Number(n).toLocaleString("id-ID");

export const fmtShort = (n) => {
  if (n >= 1e9) return "Rp " + (n / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 2 }) + " M";
  if (n >= 1e6) return "Rp " + (n / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 0 }) + " Jt";
  return fmtIDR(n);
};

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function trendArrow(series) {
  if (!series || series.length < 2) return "Stabil";
  const diff = series[series.length - 1] - series[0];
  const pct = (diff / series[0]) * 100;
  if (pct > 0.5) return "Menguat " + pct.toFixed(1) + "%";
  if (pct < -0.5) return "Menurun " + Math.abs(pct).toFixed(1) + "%";
  return "Stabil";
}
