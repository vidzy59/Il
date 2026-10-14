/* Lapisan akses data: memuat katalog via fetch, validasi, cache memori.
   Satu-satunya modul yang menyentuh jaringan/file. */
import { validateCatalog, brandsOf } from "../lib/phone.js";

let cache = null;
let cacheUrl = "";

export async function loadCatalog(url = "assets/data/phones.json") {
  if (cache && cacheUrl === url) return cache;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Gagal memuat katalog (${res.status})`);
  const list = await res.json();
  if (!Array.isArray(list) || list.length === 0) throw new Error("Katalog kosong atau format tidak valid");
  const problems = validateCatalog(list);
  if (problems.length) {
    console.warn("[FonoBase] dataset bermasalah:\n" + problems.slice(0, 10).join("\n"));
    if (problems.length > 10) console.warn(`…dan ${problems.length - 10} masalah lain`);
  }
  cache = { list, brands: brandsOf(list) };
  cacheUrl = url;
  return cache;
}

export function byId(list, id) {
  return list.find(p => p.id === id);
}
