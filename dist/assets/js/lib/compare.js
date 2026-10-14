/* Mesin perbandingan murni: baris matriks + penentuan pemenang. Tanpa DOM. */
import { totalScore, lowestOffer, maxRam, maxStorage } from "./phone.js";
import { fmtIDR } from "../utils.js";

const low = (arr) => Math.min(...arr);
const high = (arr) => Math.max(...arr);
/* Indeks pemenang tunggal, atau -1 bila seri. Seri bukan kemenangan. */
const soleWinner = (arr, fn) => {
  const b = fn(arr);
  const idx = arr.map((v, i) => (v === b ? i : -1)).filter(i => i >= 0);
  return idx.length === 1 ? idx : [];
};

export function buildCompareRows(items) {
  const mk = (label, cells, winnerIdx) => ({
    label, cells,
    winners: winnerIdx,
  });
  const prices = items.map(p => p.harga);
  const offers = items.map(lowestOffer);
  const rams = items.map(maxRam);
  const storages = items.map(maxStorage);
  const refresh = items.map(p => p.layar.refresh);
  const batteries = items.map(p => p.baterai);
  const charging = items.map(p => p.charging);
  const weights = items.map(p => p.bobot);
  const scores = items.map(totalScore);
  const get = (arr, fn) => ({ values: arr, winners: soleWinner(arr, fn) });
  const none = items.map(() => false);

  const perf = get(items.map(p => p.skor.performa), high);
  const cam = get(items.map(p => p.skor.kamera), high);
  const val = get(items.map(p => p.skor.nilai), high);
  const prc = get(prices, low);
  const off = get(offers, low);
  const ram = get(rams, high);
  const sto = get(storages, high);
  const ref = get(refresh, high);
  const bat = get(batteries, high);
  const chg = get(charging, high);
  const wgt = get(weights, low);
  const agg = get(scores, high);

  return [
    mk("Harga varian dasar", prices.map(fmtIDR), prc.winners),
    mk("Harga termurah di toko", offers.map(fmtIDR), off.winners),
    mk("Chipset", items.map(p => p.chipset), []),
    mk("RAM maksimum", rams.map(v => v + " GB"), ram.winners),
    mk("Penyimpanan maksimum", storages.map(v => v + " GB"), sto.winners),
    mk("Layar", items.map(p => `${p.layar.ukuran}" ${p.layar.tipe}`), []),
    mk("Refresh rate", refresh.map(v => v + " Hz"), ref.winners),
    mk("Kamera belakang", items.map(p => p.kamera.belakang), []),
    mk("Baterai", batteries.map(v => v + " mAh"), bat.winners),
    mk("Pengisian cepat", charging.map(v => v + " W"), chg.winners),
    mk("Bobot", weights.map(v => v + " g"), wgt.winners),
    mk("NFC", items.map(p => (p.nfc ? "Ada" : "Tidak")), items.map(p => p.nfc)),
    mk("Ketahanan", items.map(p => p.iprating), none.map(() => -1).filter(() => false)),
    mk("Skor performa", items.map(p => String(p.skor.performa)), perf.winners),
    mk("Skor kamera", items.map(p => String(p.skor.kamera)), cam.winners),
    mk("Skor nilai", items.map(p => String(p.skor.nilai)), val.winners),
    mk("Skor agregat", scores.map(v => v + "/100"), agg.winners),
  ];
}

/* Ringkasan: indeks model unggul agregat + tally kemenangan per model. */
export function compareVerdict(items) {
  const scores = items.map(totalScore);
  const best = Math.max(...scores);
  const top = scores.map((s, i) => (s === best ? i : -1)).filter(i => i >= 0);
  const tally = items.map(() => 0);
  for (const row of buildCompareRows(items)) {
    for (const w of row.winners) tally[w]++;
  }
  return { winIdx: top[0], tied: top.length > 1, tally, scores };
}
