# AKHAFIN 💰
### Aplikasi Pencatat Keuangan, Cashflow, Sisa Saldo & Total Saldo Multi-Bank & E-Wallet
*(Mendukung Instalasi di HP Android, iPhone, iPad & Tablet)*

Selamat datang di **AKHAFIN** (*Akuntansi & Keuangan Finansial*), aplikasi manajemen keuangan personal dan bisnis modern berbasis **Progressive Web App (PWA)**. Aplikasi ini dirancang untuk memonitor arus kas (cashflow) secara real-time, mengontrol sisa saldo riil di setiap rekening bank dan e-wallet, serta dapat di-install langsung di smartphone (HP) dan tablet Anda seperti aplikasi native Play Store / App Store!

---

## 📱 Cara Instal AKHAFIN di HP dan Tablet

Aplikasi AKHAFIN dapat dipasang (*install*) ke layar utama (Home Screen) HP dan tablet Anda sehingga berjalan fullscreen (tanpa address bar browser) dan bisa dibuka kapan saja secara offline.

### Langkah 1: Hubungkan HP/Tablet ke Komputer
1. Pastikan HP atau Tablet Anda terhubung ke jaringan **Wi-Fi yang sama** dengan komputer ini.
2. Di folder komputer `c:\AppC\`, **klik ganda (*double-click*)** file:
   ```
   Jalankan_Server_HP.bat
   ```
3. Jendela hitam akan muncul dan menampilkan alamat IP lokal Anda, misalnya:
   ```
   http://192.168.1.15:8080
   ```

---

### Langkah 2: Buka & Pasang di HP/Tablet

#### 🤖 Untuk HP & Tablet Android (Google Chrome / Edge / Samsung Internet):
1. Buka browser **Google Chrome** di HP/Tablet Anda.
2. Masukkan alamat URL yang tertera di komputer tadi (contoh: `http://192.168.1.15:8080`).
3. Tekan tombol **"📲 Pasang Sekarang"** pada banner di bagian atas aplikasi.
   * *Atau:* Ketuk tombol **Menu Titik Tiga (⋮)** di pojok kanan atas Chrome ➔ pilih **"Install Aplikasi"** atau **"Tambahkan ke Layar Utama" (Add to Home screen)**.
4. Tekan **Install**.
5. Ikon aplikasi **AKHAFIN** akan seketika muncul di layar beranda (Home Screen) HP/Tablet Anda!

#### 🍎 Untuk iPhone & iPad (Browser Safari):
1. Buka browser bawaan **Safari** di iPhone atau iPad Anda.
2. Masukkan alamat URL yang tertera di komputer (contoh: `http://192.168.1.15:8080`).
3. Ketuk ikon **Bagikan (Share)** di bilah navigasi bawah (ikon kotak dengan tanda panah mengarah ke atas `⎋`).
4. Gulir ke bawah pada menu opsi, lalu pilih **"Add to Home Screen"** (*Tambahkan ke Layar Utama*).
5. Ketuk **Add** di pojok kanan atas.
6. Selesai! Aplikasi AKHAFIN sekarang terpasang di iPhone/iPad Anda dan berjalan seperti aplikasi iOS resmi.

> **Keuntungan setelah di-install:**
> Berkat teknologi *Service Worker*, aplikasi akan menyimpan seluruh aset di memori HP Anda sehingga tetap dapat dibuka dan digunakan dengan lancar meskipun sedang offline.

---

## 💻 Cara Menjalankan di Komputer / Laptop

Cukup **klik ganda (double-click)** pada salah satu file berikut:
- [**`Buka_AKHAFIN.bat`**](file:///c:/AppC/Buka_AKHAFIN.bat) (Pintasan otomatis)
- Atau [**`index.html`**](file:///c:/AppC/index.html) langsung di browser Anda.

---

## 🌟 Fitur Unggulan AKHAFIN

1. **Total Saldo & Konsolidasi Likuiditas:**
   - Menampilkan total saldo gabungan dari seluruh rekening bank, e-wallet, dan kas tunai.
   - Ringkasan terpisah: **Total Saldo Bank**, **Total Saldo E-Wallet**, dan **Total Uang Tunai**.
2. **Sisa Saldo di Setiap Bank & E-Wallet:**
   - Kartu saldo khas untuk masing-masing penyedia (BCA, Mandiri, BRI, BNI, Jago, SeaBank, Jenius, BSI, CIMB, Blu, GoPay, OVO, DANA, ShopeePay, LinkAja, Uang Tunai).
   - Menampilkan sisa saldo saat ini, nomor rekening/HP, dan akses cepat ke mutasi per akun.
3. **Pencatatan Cashflow Lengkap:**
   - **🟢 Pemasukan (Income):** Gaji, freelance, hasil usaha, dividen investasi, dll.
   - **🔴 Pengeluaran (Expense):** Belanja harian, makanan/minuman, tagihan listrik/air/internet, transportasi, dll.
   - **🔵 Transfer Antar Rekening (⇄):** Top-up e-wallet (misal: BCA ke GoPay) otomatis mendebit rekening asal dan mengkredit e-wallet tujuan, lengkap dengan opsi biaya admin.
   - Format angka otomatis Rupiah Indonesia (`Rp xx.xxx.xxx`).
4. **Grafik & Analisis Finansial:**
   - Grafik tren pemasukan vs pengeluaran 6 bulan terakhir (*Pure HTML5 Canvas, tanpa lag*).
   - Donut chart alokasi pengeluaran per kategori.
   - Indikator status arus kas: **Surplus** atau **Defisit**.
   - Perhitungan rasio tabungan (*Savings Rate %*) dan daftar 5 pengeluaran terbesar.
5. **Cadangan Data & Keamanan (Backup & Restore):**
   - **100% Privat**: Data tersimpan di memori perangkat Anda, tidak dikirim ke pihak ketiga.
   - **Backup JSON**: Unduh file cadangan dan pulihkan kapan saja.
   - **Export CSV/Excel**: Ekspor mutasi ke file spreadsheet.
   - **Cetak Laporan / PDF**: Cetak laporan keuangan rapi dengan sekali klik.

---

## 📁 Struktur File

```
c:\AppC\
│
├── index.html            # Antarmuka PWA utama (responsif mobile, tablet & desktop)
├── style.css             # Tema desain lengkap (Light & Dark mode, PWA banner, print style)
├── app.js                # Logika aplikasi, state, PWA install prompt & kalkulasi saldo
├── sw.js                 # Service Worker untuk mode offline & instalasi HP/Tablet
├── manifest.json         # Konfigurasi PWA (nama, start_url, icons, display standalone)
├── chart-engine.js       # Mesin grafik canvas responsif bebas dependensi
├── sample-data.js        # Data simulasi awal bank & e-wallet Indonesia
├── Jalankan_Server_HP.bat# Server lokal otomatis untuk menghubungkan HP/Tablet via Wi-Fi
├── server.ps1            # Script server HTTP internal (zero external download)
├── Buka_AKHAFIN.bat      # Pintasan cepat untuk buka di komputer
├── icon-192.png          # Ikon PWA resolusi standar
├── icon-512.png          # Ikon PWA resolusi tinggi HD
├── apple-touch-icon.png  # Ikon khusus iOS/iPadOS Home Screen
├── favicon.png           # Favicon browser tab
└── README.md             # Panduan lengkap dokumentasi
```

---
*AKHAFIN v1.0.0 — Dibuat untuk pengelolaan keuangan yang lebih cerdas, rapi, dan terencana.*
