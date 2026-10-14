/* Halaman Katalog: penyaringan, pengurutan, halaman. */
import { totalScore, maxRam, maxStorage } from "../lib/phone.js";
import { esc } from "../utils.js";
import { store } from "../store.js";
import { rowHTML } from "./components.js";
import { SITE } from "../config.js";

export function applyFilters(list, f) {
  return list.filter(p => {
    if (f.q) {
      const q = f.q.toLowerCase();
      if (!`${p.nama} ${p.merek} ${p.chipset}`.toLowerCase().includes(q)) return false;
    }
    if (f.merek && p.merek !== f.merek) return false;
    if (f.hargaMaks && p.harga > Number(f.hargaMaks)) return false;
    if (f.ramMin && maxRam(p) < Number(f.ramMin)) return false;
    if (f.storageMin && maxStorage(p) < Number(f.storageMin)) return false;
    if (f.bateraiMin && p.baterai < Number(f.bateraiMin)) return false;
    if (f.jaringan && p.jaringan !== f.jaringan) return false;
    if (f.nfc === "ya" && !p.nfc) return false;
    return true;
  });
}

export function applySort(list, sort) {
  const a = [...list];
  switch (sort) {
    case "harga-asc": a.sort((x, y) => x.harga - y.harga); break;
    case "harga-desc": a.sort((x, y) => y.harga - x.harga); break;
    case "baterai-desc": a.sort((x, y) => y.baterai - x.baterai); break;
    case "kamera-desc": a.sort((x, y) => y.skor.kamera - x.skor.kamera); break;
    default: a.sort((x, y) => totalScore(y) - totalScore(x));
  }
  return a;
}

const FILTER_LABEL = { q: "Cari", merek: "Merek", hargaMaks: "Anggaran", ramMin: "RAM", storageMin: "Storage", bateraiMin: "Baterai", jaringan: "Jaringan", nfc: "NFC" };

function shortVal(k, v) {
  if (k === "hargaMaks") return "s.d. Rp " + (Number(v) / 1e6).toLocaleString("id-ID") + " jt";
  if (k === "ramMin") return "min. " + v + " GB";
  if (k === "storageMin") return "min. " + v + " GB";
  if (k === "bateraiMin") return "min. " + v + " mAh";
  if (k === "nfc") return "harus ada";
  return v;
}

export function renderCatalog(root, list) {
  const { filters, sort, page } = store.state;
  const filtered = applySort(applyFilters(list, filters), sort);
  const pages = Math.max(1, Math.ceil(filtered.length / SITE.perPage));
  const cur = Math.min(page, pages);
  const items = filtered.slice((cur - 1) * SITE.perPage, cur * SITE.perPage);
  const chips = Object.entries(filters)
    .filter(([, v]) => v)
    .map(([k, v]) => `<span class="chip">${esc(FILTER_LABEL[k] || k)}: <strong>${esc(shortVal(k, v))}</strong> <button data-clear="${k}" aria-label="Hapus filter">×</button></span>`);

  root.innerHTML = `
    <nav class="breadcrumb"><a href="#/">Beranda</a> &rsaquo; Katalog Ponsel</nav>
    <div class="doc-head">
      <h1>Daftar Harga dan Spesifikasi HP</h1>
      <p>${filtered.length} model memenuhi kriteria. Harga dalam Rupiah untuk varian dasar resmi Indonesia.</p>
    </div>
    <div class="toolbar">
      <label>Urutkan:
        <select id="sortSel">
          <option value="skor" ${sort === "skor" ? "selected" : ""}>Skor tertinggi</option>
          <option value="harga-asc" ${sort === "harga-asc" ? "selected" : ""}>Harga terendah</option>
          <option value="harga-desc" ${sort === "harga-desc" ? "selected" : ""}>Harga tertinggi</option>
          <option value="baterai-desc" ${sort === "baterai-desc" ? "selected" : ""}>Baterai terbesar</option>
          <option value="kamera-desc" ${sort === "kamera-desc" ? "selected" : ""}>Kamera terbaik</option>
        </select>
      </label>
      <span class="result-meta">Hal. ${cur}/${pages}</span>
    </div>
    ${chips.length ? `<div class="chips">${chips.join("")}</div>` : ""}
    ${items.length ? `<div class="rows">${items.map(rowHTML).join("")}</div>` : `<div class="empty"><p>Tidak ada model yang memenuhi kriteria. Longgarkan filter anggaran atau spesifikasi minimum.</p></div>`}
    ${pages > 1 ? `<div class="pagination">${Array.from({ length: pages }, (_, i) => `<button data-page="${i + 1}" class="${cur === i + 1 ? "active" : ""}">${i + 1}</button>`).join("")}</div>` : ""}`;

  root.querySelector("#sortSel").addEventListener("change", (e) => store.setSort(e.target.value));
  root.querySelectorAll("[data-page]").forEach(b => b.addEventListener("click", () => { store.setPage(Number(b.dataset.page)); window.scrollTo({ top: 0 }); }));
  root.querySelectorAll("[data-clear]").forEach(b => b.addEventListener("click", () => store.setFilters({ [b.dataset.clear]: "" })));
}
