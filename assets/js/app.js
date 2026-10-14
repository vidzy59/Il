/* Bootstrap FonoBase: muat katalog, inisialisasi chrome, router hash. */
import { SITE } from "./config.js";
import { loadCatalog, byId } from "./services/dataService.js";
import { totalScore } from "./lib/phone.js";
import { esc, fmtShort } from "./utils.js";
import { store } from "./store.js";
import { renderHome } from "./views/home.js";
import { renderCatalog } from "./views/catalog.js";
import { renderDetail } from "./views/detail.js";
import { renderCompare } from "./views/compare.js";
import { renderGuide, renderAbout } from "./views/static.js";
import { fullName } from "./views/components.js";

const app = document.getElementById("app");
const nav = document.getElementById("primaryNav");
let ctx = { list: [], brands: [] };

function setActive(route) {
  nav.querySelectorAll("a").forEach(a => a.classList.toggle("active", a.dataset.route === route));
}

function fail(message) {
  app.innerHTML = `<div class="empty"><p>${esc(message)}</p><p><a href="#/">Muat ulang beranda</a></p></div>`;
}

function route() {
  if (!ctx.list.length) return;
  const hash = location.hash || "#/";
  const m = hash.match(/^#\/([^?]*)(\?.*)?$/);
  const seg = (m ? m[1] : "").split("/").filter(Boolean);
  const q = {};
  if (m && m[2]) new URLSearchParams(m[2].slice(1)).forEach((v, k) => (q[k] = v));

  try {
    if (seg.length === 0) { setActive("home"); renderHome(app, ctx.list); }
    else if (seg[0] === "katalog") { setActive("katalog"); renderCatalog(app, ctx.list); }
    else if (seg[0] === "detail" && seg[1]) {
      setActive("katalog");
      renderDetail(app, ctx.list, decodeURIComponent(seg[1]), seg[2] ? decodeURIComponent(seg[2]) : "spesifikasi");
    }
    else if (seg[0] === "bandingkan") {
      setActive("bandingkan");
      renderCompare(app, ctx.list, q.ids ? q.ids.split(",").map(decodeURIComponent) : null);
    }
    else if (seg[0] === "panduan") { setActive("panduan"); renderGuide(app); }
    else if (seg[0] === "tentang") { setActive("tentang"); renderAbout(app); }
    else { setActive("home"); renderHome(app, ctx.list); }
  } catch (err) {
    console.error(err);
    fail("Terjadi kesalahan saat menampilkan halaman. Coba muat ulang.");
    return;
  }
  bindCompareButtons();
  window.scrollTo({ top: 0 });
}

function bindCompareButtons() {
  app.querySelectorAll("[data-compare]").forEach(b => {
    b.addEventListener("click", (e) => {
      e.preventDefault();
      if (store.state.compare.length >= SITE.maxCompare && !store.state.compare.includes(b.dataset.compare)) {
        store.setCompare([...store.state.compare.slice(1), b.dataset.compare]);
      } else {
        store.toggleCompare(b.dataset.compare);
      }
    });
  });
}

function syncFinder(f) {
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ""; };
  set("fMerek", f.merek); set("fHarga", f.hargaMaks); set("fRam", f.ramMin);
  set("fStorage", f.storageMin); set("fBat", f.bateraiMin); set("fJar", f.jaringan); set("fNfc", f.nfc);
}

function initChrome() {
  document.getElementById("statCount").textContent = ctx.list.length;
  const merekSel = document.getElementById("fMerek");
  ctx.brands.forEach(b => {
    const o = document.createElement("option");
    o.textContent = b; merekSel.appendChild(o);
  });
  syncFinder(store.state.filters);

  document.getElementById("finderForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    store.setFilters({
      merek: fd.get("merek") || "", hargaMaks: fd.get("hargaMaks") || "",
      ramMin: fd.get("ramMin") || "", storageMin: fd.get("storageMin") || "",
      bateraiMin: fd.get("bateraiMin") || "", jaringan: fd.get("jaringan") || "",
      nfc: fd.get("nfc") || "",
    });
    location.hash = "#/katalog";
  });
  document.getElementById("finderReset").addEventListener("click", () => {
    store.resetFilters(); syncFinder(store.state.filters);
    if ((location.hash || "").startsWith("#/katalog")) route();
  });

  const brandLinks = document.getElementById("brandLinks");
  brandLinks.innerHTML = ctx.brands.map(b => {
    const n = ctx.list.filter(p => p.merek === b).length;
    return `<li><a href="#/katalog" data-brand="${esc(b)}">${esc(b)}</a><span class="n">${n}</span></li>`;
  }).join("");
  brandLinks.querySelectorAll("[data-brand]").forEach(a => a.addEventListener("click", () => {
    store.resetFilters(); store.setFilters({ merek: a.dataset.brand });
  }));

  document.getElementById("popularList").innerHTML = [...ctx.list]
    .sort((a, b) => b.populer - a.populer).slice(0, 7)
    .map((p, i) => `<li><span class="rank">${i + 1}</span><span><a href="#/detail/${p.id}">${fullName(p)}</a><small>${fmtShort(p.harga)} · skor ${totalScore(p)}</small></span></li>`).join("");

  const input = document.getElementById("globalSearch");
  const box = document.getElementById("searchSuggest");
  const doSearch = () => {
    store.setFilters({ q: input.value.trim() });
    box.classList.remove("open"); box.innerHTML = "";
    location.hash = "#/katalog";
  };
  document.getElementById("globalSearchBtn").addEventListener("click", doSearch);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(); });
  input.addEventListener("input", () => {
    const val = input.value.trim().toLowerCase();
    if (val.length < 2) { box.classList.remove("open"); box.innerHTML = ""; return; }
    const hits = ctx.list.filter(p => `${p.nama} ${p.merek} ${p.chipset}`.toLowerCase().includes(val)).slice(0, 6);
    if (!hits.length) { box.classList.remove("open"); box.innerHTML = ""; return; }
    box.innerHTML = hits.map(p => `<a href="#/detail/${p.id}"><span><strong>${fullName(p)}</strong><br><small>${esc(p.chipset)}</small></span><span>${fmtShort(p.harga)}</span></a>`).join("");
    box.classList.add("open");
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".searchbar")) box.classList.remove("open"); });

  store.on(refreshCompareChrome);
  refreshCompareChrome();
}

function refreshCompareChrome() {
  const ids = store.state.compare;
  document.getElementById("compareCount").textContent = ids.length;
  const box = document.getElementById("compareMiniList");
  box.innerHTML = ids.length
    ? `<ul class="linklist" style="list-style:none;margin:0 0 6px;padding:0">` + ids.map(id => {
        const p = byId(ctx.list, id);
        return p ? `<li><span>${esc(p.nama)}</span><button class="link-btn" data-rm="${id}" aria-label="Hapus">×</button></li>` : "";
      }).join("") + `</ul>`
    : `<p>Belum ada model dipilih.</p>`;
  box.querySelectorAll("[data-rm]").forEach(b => b.addEventListener("click", () => store.removeCompare(b.dataset.rm)));
  document.querySelectorAll("#app [data-compare]").forEach(b => {
    const on = store.state.compare.includes(b.dataset.compare);
    b.classList.toggle("on", on);
    if (b.classList.contains("link-btn")) b.textContent = on ? "Sudah dipilih" : "+ Bandingkan";
  });
  const detailBtn = document.querySelector("#app .detail-cta [data-compare]");
  if (detailBtn) {
    detailBtn.textContent = store.state.compare.includes(detailBtn.dataset.compare)
      ? "Terdaftar di Pembanding" : "+ Tambah ke Pembanding";
  }
}

window.addEventListener("hashchange", route);

app.innerHTML = `<div class="empty"><p>Memuat katalog…</p></div>`;
loadCatalog()
  .then(c => { ctx = { list: c.list, brands: c.brands }; initChrome(); route(); })
  .catch(err => { console.error(err); fail("Katalog gagal dimuat. Periksa koneksi lalu muat ulang halaman."); });
