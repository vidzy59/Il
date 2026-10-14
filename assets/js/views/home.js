/* Halaman Beranda. */
import { totalScore } from "../lib/phone.js";
import { fmtShort, esc } from "../utils.js";
import { store } from "../store.js";
import { rowHTML, sectionHead, fullName } from "./components.js";

export function renderHome(root, list) {
  const terbaru = [...list].sort((a, b) => b.tahun - a.tahun || b.populer - a.populer).slice(0, 5);
  const populer = [...list].sort((a, b) => b.populer - a.populer).slice(0, 5);
  const murah = [...list].sort((a, b) => b.skor.nilai - a.skor.nilai).slice(0, 4);
  const maxTahun = Math.max(...list.map(p => p.tahun));
  const brands = {};
  list.forEach(p => { brands[p.merek] = (brands[p.merek] || 0) + 1; });

  root.innerHTML = `
    <div class="doc-head">
      <h1>Direktori Ponsel Indonesia</h1>
      <p>Harga resmi, spesifikasi lengkap, dan perbandingan head-to-head. Data diperbarui berkala dari toko resmi dan distributor terdaftar.</p>
    </div>
    <div class="home-cols">
      <section>
        ${sectionHead(`Ponsel Terbaru (${maxTahun})`, "Indeks lengkap", "#/katalog")}
        <div class="rows">${terbaru.map(rowHTML).join("")}</div>
        ${sectionHead("Nilai Terbaik di Kelasnya", "Semua unit", "#/katalog")}
        <div class="rows" style="margin-top:0">${murah.map(rowHTML).join("")}</div>
      </section>
      <section>
        ${sectionHead("Paling Banyak Dibaca")}
        <ol class="ranklist">${populer.map((p, i) => `<li><span class="rank">${i + 1}</span><span><a href="#/detail/${p.id}">${fullName(p)}</a><small>${fmtShort(p.harga)} · skor ${totalScore(p)}</small></span></li>`).join("")}</ol>
        ${sectionHead("Indeks Merek")}
        <ul class="brandindex">${Object.entries(brands).sort().map(([b, n]) => `<li><a href="#/katalog" data-brand="${esc(b)}">${esc(b)} <span>(${n})</span></a></li>`).join("")}</ul>
        <div class="panel">
          <h2>Perbandingan Populer</h2>
          <ul class="vslinks">
            <li><a href="#/bandingkan?ids=poco-x7-pro,xiaomi-redmi-note-14-pro">Poco X7 Pro vs Redmi Note 14 Pro 5G</a></li>
            <li><a href="#/bandingkan?ids=samsung-galaxy-a56,samsung-galaxy-a36">Galaxy A56 vs Galaxy A36</a></li>
            <li><a href="#/bandingkan?ids=xiaomi-14t,vivo-v40">Xiaomi 14T vs Vivo V40</a></li>
          </ul>
        </div>
      </section>
    </div>`;
  root.querySelectorAll("[data-brand]").forEach(a => a.addEventListener("click", () => {
    store.resetFilters(); store.setFilters({ merek: a.dataset.brand });
  }));
}
