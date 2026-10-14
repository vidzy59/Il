/* Konfigurasi situs terpusat. Satu sumber kebenaran untuk konstanta tampilan. */
export const SITE = {
  brand: "FONOBASE",
  tagline: "ARENA PONSEL",
  title: "FonoBase — Harga, Spesifikasi, dan Perbandingan HP",
  locale: "id-ID",
  currency: "IDR",
  perPage: 6,
  maxCompare: 3,
  photoBase: "https://picsum.photos/seed",
};

/* Bobot skor agregat. Jumlah harus 1.0 — divalidasi oleh pengujian. */
export const SCORE_WEIGHTS = {
  performa: 0.30,
  kamera: 0.25,
  layar: 0.20,
  daya: 0.15,
  nilai: 0.10,
};

export const ROUTES = ["home", "katalog", "bandingkan", "panduan", "tentang"];
