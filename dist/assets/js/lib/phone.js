/* Logika domain ponsel murni. Tanpa DOM, tanpa state — dapat diuji langsung. */
import { SCORE_WEIGHTS, SITE } from "../config.js";

export function totalScore(p) {
  const s = p.skor;
  let total = 0;
  for (const [k, w] of Object.entries(SCORE_WEIGHTS)) total += (s[k] || 0) * w;
  return Math.round(total);
}

export function lowestOffer(p) {
  return Math.min(...p.toko.map(t => t.harga));
}

export function maxRam(p) { return Math.max(...p.ram); }
export function maxStorage(p) { return Math.max(...p.storage); }

export function photo(p, w = 640, h = 400) {
  return `${SITE.photoBase}/fono-${p.id}/${w}/${h}`;
}

export function brandsOf(list) {
  return [...new Set(list.map(p => p.merek))].sort();
}

/* Validasi satu entri ponsel. Mengembalikan daftar pelanggaran (kosong = valid). */
export function validatePhone(p, index) {
  const errs = [];
  const where = `phones[${index}]${p && p.id ? ` (${p.id})` : ""}`;
  const req = ["id", "nama", "merek", "chipset", "os", "tahun", "harga"];
  for (const k of req) if (p[k] === undefined || p[k] === "") errs.push(`${where}: field "${k}" wajib ada`);
  if (p.harga !== undefined && !(p.harga > 0)) errs.push(`${where}: harga harus positif`);
  if (p.baterai !== undefined && !(p.baterai > 0)) errs.push(`${where}: baterai harus positif`);
  for (const d of Object.keys(SCORE_WEIGHTS)) {
    const v = p.skor && p.skor[d];
    if (!(v >= 0 && v <= 100)) errs.push(`${where}: skor.${d} harus 0–100`);
  }
  if (!Array.isArray(p.toko) || p.toko.length === 0) errs.push(`${where}: minimal satu toko`);
  if (!Array.isArray(p.riwayat) || p.riwayat.length < 2) errs.push(`${where}: riwayat harga minimal 2 periode`);
  if (!Array.isArray(p.ram) || !Array.isArray(p.storage)) errs.push(`${where}: ram/storage harus array`);
  return errs;
}

export function validateCatalog(list) {
  const errs = [];
  const ids = new Set();
  list.forEach((p, i) => {
    if (ids.has(p.id)) errs.push(`duplikat id: ${p.id}`);
    ids.add(p.id);
    errs.push(...validatePhone(p, i));
  });
  return errs;
}
