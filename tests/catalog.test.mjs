/* Pengujian integritas arsitektur FonoBase. Jalankan: node --test tests/catalog.test.mjs */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const phones = JSON.parse(readFileSync(join(root, "assets/data/phones.json"), "utf8"));
const { SCORE_WEIGHTS } = await import("../assets/js/config.js");
const phone = await import("../assets/js/lib/phone.js");
const { buildCompareRows, compareVerdict } = await import("../assets/js/lib/compare.js");

describe("dataset phones.json", () => {
  it("berisi 12 entri unik", () => {
    assert.equal(phones.length, 12);
    assert.equal(new Set(phones.map(p => p.id)).size, 12);
  });
  it("lolos validasi katalog tanpa pelanggaran", () => {
    assert.deepEqual(phone.validateCatalog(phones), []);
  });
  it("bobot skor berjumlah 1.0", () => {
    const sum = Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1.0) < 1e-9);
  });
  it("setiap dimensi skor tercakup bobot", () => {
    for (const p of phones) {
      for (const k of Object.keys(SCORE_WEIGHTS)) {
        assert.ok(Number.isFinite(p.skor[k]), `${p.id} skor.${k}`);
      }
    }
  });
});

describe("lib/phone.js", () => {
  it("totalScore konsisten 0–100", () => {
    for (const p of phones) {
      const s = phone.totalScore(p);
      assert.ok(s >= 0 && s <= 100, `${p.id}: ${s}`);
    }
  });
  it("lowestOffer adalah minimum toko", () => {
    for (const p of phones) {
      assert.equal(phone.lowestOffer(p), Math.min(...p.toko.map(t => t.harga)));
    }
  });
});

describe("lib/compare.js", () => {
  it("matriks 17 baris dengan pemenang valid", () => {
    const rows = buildCompareRows(phones.slice(0, 3));
    assert.equal(rows.length, 17);
    for (const r of rows) {
      assert.equal(r.cells.length, 3);
      for (const w of r.winners) assert.ok(w >= 0 && w < 3, `${r.label}: ${w}`);
    }
  });
  it("seri menghasilkan winners kosong, bukan pemenang palsu", () => {
    const a = phones[0];
    const rows = buildCompareRows([a, JSON.parse(JSON.stringify(a))]);
    const harga = rows.find(r => r.label === "Harga varian dasar");
    assert.deepEqual(harga.winners, []);
  });
  it("verdict menunjuk skor agregat tertinggi", () => {
    const items = phones.slice(0, 3);
    const v = compareVerdict(items);
    const scores = items.map(phone.totalScore);
    assert.equal(v.scores[v.winIdx], Math.max(...scores));
  });
});

describe("struktur modul", () => {
  it("setiap view adalah modul terpisah", () => {
    const views = readdirSync(join(root, "assets/js/views"));
    for (const f of ["home.js", "catalog.js", "detail.js", "compare.js", "static.js", "components.js"]) {
      assert.ok(views.includes(f), `hilang: ${f}`);
    }
  });
  it("tidak ada sisa monolit views.js / data.js", () => {
    const js = readdirSync(join(root, "assets/js"));
    assert.ok(!js.includes("views.js") && !js.includes("data.js"));
  });
});
