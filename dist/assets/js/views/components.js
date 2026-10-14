/* Komponen presentasi bersama: nama, lencana skor, baris daftar. */
import { totalScore, lowestOffer, maxRam, maxStorage, photo } from "../lib/phone.js";
import { fmtShort, esc } from "../utils.js";
import { store } from "../store.js";

export function fullName(p) {
  const n = (p.nama || "").trim();
  return esc(n.toLowerCase().startsWith(p.merek.toLowerCase()) ? n : p.merek + " " + n);
}

export function scoreBadge(p) {
  const s = totalScore(p);
  const cls = s >= 85 ? "s-exc" : s >= 75 ? "s-good" : "s-mid";
  return `<span class="score-badge ${cls}">${s}</span>`;
}

export function rowHTML(p) {
  const inCmp = store.state.compare.includes(p.id);
  return `
  <article class="row-item">
    <a class="row-thumb" href="#/detail/${p.id}" tabindex="-1" aria-hidden="true">
      <img src="${photo(p, 240, 180)}" alt="Foto ${fullName(p)}">
    </a>
    <div class="row-main">
      <h3 class="row-name"><a href="#/detail/${p.id}">${fullName(p)}</a></h3>
      <p class="row-sub">${esc(p.chipset)} · RAM hingga ${maxRam(p)} GB · ${maxStorage(p)} GB · ${p.baterai} mAh · ${esc(p.jaringan)}</p>
      <p class="row-price">${fmtShort(p.harga)} <span class="row-low">termurah ${fmtShort(lowestOffer(p))} · ${p.toko.length} toko</span></p>
      <div class="row-actions">
        <a class="link-btn" href="#/detail/${p.id}">Spesifikasi lengkap</a>
        <button class="link-btn ${inCmp ? "on" : ""}" data-compare="${p.id}">${inCmp ? "Sudah dipilih" : "+ Bandingkan"}</button>
      </div>
    </div>
    <div class="row-score">${scoreBadge(p)}<span>skor</span></div>
  </article>`;
}

export function sectionHead(title, linkText, linkHref) {
  return `<div class="sec-head"><h2>${esc(title)}</h2>${linkText ? `<a href="${linkHref}">${esc(linkText)}</a>` : ""}</div>`;
}
