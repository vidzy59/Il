/* Halaman Detail: ringkasan cepat + tab Spesifikasi/Harga/Tren/Ulasan. */
import { totalScore, lowestOffer, photo } from "../lib/phone.js";
import { fmtIDR, fmtShort, esc, trendArrow } from "../utils.js";
import { store } from "../store.js";
import { drawLineChart } from "../charts.js";
import { rowHTML, sectionHead, fullName } from "./components.js";

export function renderDetail(root, list, id, tab = "spesifikasi") {
  const p = list.find(x => x.id === id);
  if (!p) {
    root.innerHTML = `<div class="empty"><p>Model tidak ditemukan. <a href="#/katalog">Kembali ke katalog</a>.</p></div>`;
    return;
  }
  const score = totalScore(p);
  const best = lowestOffer(p);
  const inCmp = store.state.compare.includes(p.id);
  const related = list.filter(x => x.id !== p.id && (x.merek === p.merek || Math.abs(x.harga - p.harga) < 2000000)).slice(0, 4);

  root.innerHTML = `
    <nav class="breadcrumb"><a href="#/">Beranda</a> &rsaquo; <a href="#/katalog">Katalog</a> &rsaquo; <a href="#/katalog" data-merek="${esc(p.merek)}">${esc(p.merek)}</a> &rsaquo; ${esc(p.nama)}</nav>
    <div class="doc-head">
      <h1>Harga dan Spesifikasi ${fullName(p)}</h1>
      <p>Diperkenalkan ${p.tahun} · ${esc(p.jaringan)} · ${esc(p.os)} · Mulai ${fmtShort(p.harga)}</p>
    </div>
    <div class="detail-top">
      <figure class="detail-photo">
        <img src="${photo(p)}" alt="Foto ${fullName(p)}">
        <figcaption>Foto ilustrasi. Unit uji dan dokumentasi aktual dapat berbeda menurut varian warna.</figcaption>
      </figure>
      <div class="quickbox">
        <table class="quicktable">
          <tr><th>Jaringan</th><td>${esc(p.jaringan)} · ${esc(p.sim)}</td></tr>
          <tr><th>Layar</th><td>${p.layar.ukuran}&Prime; ${esc(p.layar.tipe)}, ${p.layar.refresh} Hz</td></tr>
          <tr><th>Chipset</th><td>${esc(p.chipset)}</td></tr>
          <tr><th>Memori</th><td>RAM ${p.ram.join("/")} GB · ${p.storage.join("/")} GB</td></tr>
          <tr><th>Kamera</th><td>${esc(p.kamera.belakang.split("+")[0].trim())}</td></tr>
          <tr><th>Baterai</th><td>${p.baterai} mAh · ${p.charging} W</td></tr>
          <tr><th>Harga</th><td class="qprice">${fmtIDR(p.harga)} <small>(termurah ${fmtShort(best)})</small></td></tr>
        </table>
        <div class="scoreline"><span>Skor redaksi</span><strong>${score}/100</strong></div>
        <div class="scorebars">${["performa", "kamera", "layar", "daya", "nilai"].map(k => `
          <div class="sbar"><span>${k}</span><div class="track"><div class="fill" style="width:${p.skor[k]}%"></div></div><b>${p.skor[k]}</b></div>`).join("")}</div>
        <div class="detail-cta">
          <button class="btn-primary" data-compare="${p.id}">${inCmp ? "Terdaftar di Pembanding" : "+ Tambah ke Pembanding"}</button>
          <a class="btn-ghost" href="#/bandingkan">Buka Pembanding</a>
        </div>
      </div>
    </div>

    <div class="tabs" role="tablist">
      ${[["spesifikasi", "Spesifikasi"], ["harga", `Harga di Toko (${p.toko.length})`], ["riwayat", "Tren Harga"], ["ulasan", `Ulasan (${p.ulasan.length})`]].map(([k, l]) => `<button role="tab" data-tab="${k}" class="${tab === k ? "active" : ""}">${l}</button>`).join("")}
    </div>
    <div id="tabBody"></div>

    ${sectionHead("Model Terkait", "Katalog", "#/katalog")}
    <div class="rows">${related.map(rowHTML).join("")}</div>`;

  const merekLink = root.querySelector("[data-merek]");
  if (merekLink) merekLink.addEventListener("click", () => { store.resetFilters(); store.setFilters({ merek: p.merek }); });
  root.querySelectorAll("[data-tab]").forEach(b => b.addEventListener("click", () => {
    location.hash = `#/detail/${p.id}/${b.dataset.tab}`;
  }));
  renderDetailTab(root.querySelector("#tabBody"), p, tab);
}

function renderDetailTab(body, p, tab) {
  if (tab === "harga") {
    const best = lowestOffer(p);
    body.innerHTML = `
      <p class="tab-lede">Perbandingan harga antar toko untuk varian dasar. Kolom selisih dihitung terhadap penawaran terendah.</p>
      <div class="tablewrap"><table class="merchant">
        <thead><tr><th>Toko</th><th>Harga</th><th>Selisih</th><th>Keterangan</th><th>Ketersediaan</th><th>Penilaian</th></tr></thead>
        <tbody>${p.toko.map(t => `
          <tr class="${t.harga === best ? "bestrow" : ""}"><td><strong>${esc(t.nama)}</strong></td>
          <td class="${t.harga === best ? "best" : ""}">${fmtIDR(t.harga)}${t.harga === best ? " — Termurah" : ""}</td>
          <td>${t.harga === best ? "—" : "+" + fmtShort(t.harga - best)}</td>
          <td>${esc(t.catatan)}</td><td>${esc(t.stok)}</td>
          <td>${t.rating.toFixed(1)}/5,0</td></tr>`).join("")}
        </tbody></table></div>
      <p class="note">Harga dapat berubah tanpa pemberitahuan. Pastikan segel distributor resmi Indonesia dan kartu garansi sebelum pembayaran.</p>`;
  } else if (tab === "riwayat") {
    body.innerHTML = `
      <p class="tab-lede">Pergerakan harga enam periode pencatatan terakhir. Tren: <strong>${trendArrow(p.riwayat)}</strong>.</p>
      <canvas class="chart" id="histChart"></canvas>
      <table class="merchant"><thead><tr>${p.riwayat.map((_, i) => `<th>Periode ${i + 1}</th>`).join("")}</tr></thead>
      <tbody><tr>${p.riwayat.map(v => `<td>${fmtShort(v)}</td>`).join("")}</tr></tbody></table>`;
    drawLineChart(body.querySelector("#histChart"), p.riwayat, ["P1", "P2", "P3", "P4", "P5", "P6"]);
  } else if (tab === "ulasan") {
    body.innerHTML = `
      <p class="tab-lede">Hasil pengujian dan observasi redaksi. Skor 0–5 per catatan uji.</p>
      ${p.ulasan.map(u => `<div class="review"><div class="review-head"><strong>${esc(u.nama)}</strong><span>${u.nilai.toFixed(1)}/5,0</span></div><p>${esc(u.isi)}</p></div>`).join("")}`;
  } else {
    body.innerHTML = `
      <p class="tab-lede">${esc(p.deskripsi)}</p>
      <table class="spectable">
        <tr class="group"><td colspan="2">Umum</td></tr>
        <tr><td>Merek / Model</td><td>${fullName(p)}</td></tr>
        <tr><td>Tahun rilis / Sistem operasi</td><td>${p.tahun} / ${esc(p.os)}</td></tr>
        <tr><td>Dukungan pembaruan</td><td>${esc(p.update)}</td></tr>
        <tr class="group"><td colspan="2">Layar</td></tr>
        <tr><td>Ukuran / Tipe</td><td>${p.layar.ukuran} inci ${esc(p.layar.tipe)}</td></tr>
        <tr><td>Refresh rate / Resolusi</td><td>${p.layar.refresh} Hz / ${esc(p.layar.resolusi)}</td></tr>
        <tr><td>Proteksi</td><td>${esc(p.layar.proteksi)}</td></tr>
        <tr class="group"><td colspan="2">Dapur Pacu</td></tr>
        <tr><td>Chipset</td><td>${esc(p.chipset)}</td></tr>
        <tr><td>CPU / GPU</td><td>${esc(p.cpu)} / ${esc(p.gpu)}</td></tr>
        <tr><td>RAM / Penyimpanan</td><td>${p.ram.join(" / ")} GB / ${p.storage.join(" / ")} GB${p.microsd ? " (+ microSD)" : ""}</td></tr>
        <tr class="group"><td colspan="2">Kamera</td></tr>
        <tr><td>Belakang</td><td>${esc(p.kamera.belakang)}</td></tr>
        <tr><td>Depan / Video</td><td>${esc(p.kamera.depan)} / ${esc(p.kamera.video)}</td></tr>
        <tr class="group"><td colspan="2">Baterai</td></tr>
        <tr><td>Kapasitas / Pengisian</td><td>${p.baterai} mAh / ${p.charging} W kabel</td></tr>
        <tr class="group"><td colspan="2">Konektivitas dan Fisik</td></tr>
        <tr><td>SIM / Jaringan / NFC</td><td>${esc(p.sim)} / ${esc(p.jaringan)} / ${p.nfc ? "Ada" : "Tidak ada"}</td></tr>
        <tr><td>Audio / Ketahanan</td><td>${esc(p.speaker)}${p.jack35 ? " / jack 3,5 mm" : ""} / ${esc(p.iprating)}</td></tr>
        <tr><td>Dimensi / Bobot</td><td>${esc(p.dimensi)} / ${p.bobot} g</td></tr>
      </table>`;
  }
}
