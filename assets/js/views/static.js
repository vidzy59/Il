/* Halaman statis: Panduan dan Tentang. */
export function renderGuide(root) {
  root.innerHTML = `
  <nav class="breadcrumb"><a href="#/">Beranda</a> &rsaquo; Panduan</nav>
  <div class="doc-head"><h1>Panduan dan Glosarium</h1>
    <p>Bobot penilaian terbuka dan istilah teknis dijelaskan tanpa jargon pemasaran.</p></div>
  <div class="prose">
    <h2>Rumus Skor Agregat</h2>
    <p>Skor = (Performa × 30%) + (Kamera × 25%) + (Layar × 20%) + (Daya × 15%) + (Nilai × 10%). Tiap dimensi 0–100 dari pengujian redaksi dan data pembanding sekelas.</p>
    <h2>Glosarium</h2>
    <table class="spectable"><tbody>
    <tr><td>Garansi resmi</td><td>Unit diedarkan distributor Indonesia dengan kartu garansi dan layanan purnajual domestik.</td></tr>
    <tr><td>OIS</td><td>Stabilisasi optik pada modul kamera untuk mengurangi goyangan saat memotret dan merekam.</td></tr>
    <tr><td>Refresh rate</td><td>Frekuensi pembaruan layar per detik. 120 Hz ke atas menghasilkan gerakan lebih mulus.</td></tr>
    <tr><td>IP rating</td><td>Sertifikasi ketahanan debu dan air. IP68 berarti tahan rendaman dangkal sesuai standar uji.</td></tr>
    <tr><td>eSIM</td><td>SIM tertanam yang diaktivasi lewat operator tanpa kartu fisik.</td></tr>
    <tr><td>AnTuTu</td><td>Tolak ukur sintetis performa sistem. Angka antar versi tidak dapat dibandingkan langsung.</td></tr>
    </tbody></table>
    <h2>Protokol Pembelian</h2>
    <p>1. Samakan varian RAM/penyimpanan saat membandingkan harga. 2. Verifikasi segel dan IMEI sebelum aktivasi. 3. Periksa kebijakan garansi toko selain garansi distributor. 4. Uji unit (layar, kamera, pengisian) di tempat sebelum meninggalkan toko.</p>
  </div>`;
}

export function renderAbout(root) {
  root.innerHTML = `
  <nav class="breadcrumb"><a href="#/">Beranda</a> &rsaquo; Tentang</nav>
  <div class="doc-head"><h1>Tentang FonoBase</h1>
    <p>Direktori spesifikasi, agregasi harga toko, dan perbandingan head-to-head untuk ponsel yang dipasarkan di Indonesia. Skor disusun redaksi tanpa penempatan berbayar.</p></div>
  <div class="prose">
    <h2>Kontak</h2>
    <p>Koreksi data: redaksi@fonobase.example. Usulan model baru: kurasi@fonobase.example. Operasional Senin–Jumat, 09.00–17.00 WIB.</p>
  </div>`;
}
