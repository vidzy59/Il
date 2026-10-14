/* Halaman Pembanding head-to-head. */
import { totalScore, lowestOffer, photo } from "../lib/phone.js";
import { buildCompareRows, compareVerdict } from "../lib/compare.js";
import { fmtShort, esc } from "../utils.js";
import { store } from "../store.js";
import { SITE } from "../config.js";
import { rowHTML, fullName } from "./components.js";

export function renderCompare(root, list, presetIds) {
  if (presetIds && presetIds.length) {
    store.setCompare(presetIds.filter(id => list.some(p => p.id === id)));
  }
  const ids = store.state.compare;
  const items = ids.map(id => list.find(p => p.id === id)).filter(Boolean);
  const slots = Array.from({ length: SITE.maxCompare }, (_, i) => {
    const sel = items[i];
    return `<div class="slot"><strong>Posisi ${String.fromCharCode(65 + i)}</strong>
      <select data-slot="${i}"><option value="">— Pilih model —</option>${list.map(p => `<option value="${p.id}" ${sel && sel.id === p.id ? "selected" : ""}>${fullName(p)}</option>`).join("")}</select>
      ${sel ? `<p class="slot-info">${fmtShort(sel.harga)} · skor ${totalScore(sel)}</p>` : `<p class="slot-empty">Slot kosong</p>`}
    </div>`;
  }).join("");

  if (items.length < 2) {
    root.innerHTML = `
    <nav class="breadcrumb"><a href="#/">Beranda</a> &rsaquo; Pembanding</nav>
    <div class="doc-head"><h1>Bandingkan Ponsel</h1>
      <p>Pilih minimal dua model untuk mengaktifkan tabel perbandingan. Pemenang tiap parameter ditandai pada barisnya.</p></div>
    <div class="compare-select">${slots}</div>
    <div class="empty"><p>Belum cukup model untuk dibandingkan. Gunakan tombol &ldquo;+ Bandingkan&rdquo; pada daftar atau pilih melalui slot di atas.</p></div>
    <div class="sec-head"><h2>Semua Model</h2></div>
    <div class="rows">${list.map(rowHTML).join("")}</div>`;
  } else {
    const rows = buildCompareRows(items);
    const { winIdx, tied, tally, scores } = compareVerdict(items);
    root.innerHTML = `
    <nav class="breadcrumb"><a href="#/">Beranda</a> &rsaquo; Pembanding</nav>
    <div class="doc-head"><h1>${items.map(p => fullName(p)).join(" vs ")}</h1>
      <p>Perbandingan ${items.length} model, parameter per parameter. Sel yang disorot menandakan pemenang baris tersebut.</p></div>
    <div class="compare-select">${slots}</div>
    <div class="verdict">${items.map((p, i) => `
      <div class="verdict-card ${i === winIdx && !tied ? "first" : ""}">
        <img src="${photo(p, 320, 200)}" alt="Foto ${fullName(p)}" loading="lazy">
        <strong>${fullName(p)}</strong>
        <span class="v-price">${fmtShort(p.harga)}</span>
        <span class="v-score">Skor agregat <b>${scores[i]}/100</b> · ${tally[i]} kemenangan baris${i === winIdx && !tied ? ' <em class="win-tag">Unggul</em>' : ""}</span>
        <a class="btn-ghost" href="#/detail/${p.id}">Spesifikasi</a>
        <button class="link-btn" data-uncompare="${p.id}">Keluarkan</button>
      </div>`).join("")}</div>
    <div class="tablewrap"><table class="comptable">
      <thead><tr><th>Parameter</th>${items.map(p => `<th>${fullName(p)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(r => `<tr><td>${esc(r.label)}</td>${r.cells.map((c, i) => `<td class="${r.winners.includes(i) ? "winner" : ""}">${esc(c)}${r.winners.includes(i) ? ' <em class="win-tag">Menang</em>' : ""}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></div>
    <p class="note">Penilaian redaksi: <strong>${fullName(items[winIdx])}</strong> unggul agregat (${scores[winIdx]}/100)${tied ? " — skor seri, pemenang ditentukan oleh jumlah kemenangan baris" : ""}. Keputusan pembelian tetap menyesuaikan prioritas: performa, kamera, daya tahan, atau anggaran.</p>`;
  }
  root.querySelectorAll("[data-slot]").forEach(s => s.addEventListener("change", () => {
    const next = Array.from({ length: SITE.maxCompare }, (_, i) => root.querySelector(`[data-slot="${i}"]`).value).filter(Boolean);
    store.setCompare(next);
    location.hash = "#/bandingkan";
  }));
  root.querySelectorAll("[data-uncompare]").forEach(b => b.addEventListener("click", () => store.removeCompare(b.dataset.uncompare)));
}
