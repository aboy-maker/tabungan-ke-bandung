# 💖 Celengan Couple - Abiyu & Manda (Serverless Online 24 Jam Gratis)

Aplikasi pencatatan tabungan bersama antara **Abiyu & Manda** yang dapat diakses 24 jam nonstop secara online secara gratis, tanpa perlu memasukkan kartu kredit untuk deployment!

Aplikasi ini menggunakan arsitektur **Serverless Client-Side Sync**:
- **Hosting**: Di-host secara gratis di **Vercel** atau **GitHub Pages** (100% gratis, tidak butuh kartu kredit, dan selalu aktif 24 jam nonstop tanpa pernah tertidur).
- **Database**: Menggunakan **kvdb.io** (API database key-value publik gratis yang tidak memerlukan pendaftaran atau kartu kredit).
- **Data Sync**: Sinkronisasi data real-time antar perangkat menggunakan kode hubung unik (Bucket ID).

---

## 🚀 Cara Deploy Gratis 24 Jam di Vercel (Tanpa Kartu Kredit)

Vercel adalah platform hosting gratis terbaik yang tidak mewajibkan pengisian kartu untuk verifikasi. Ikuti langkah mudah berikut:

### Langkah 1: Unggah Kode ke GitHub
1. Buat akun di [GitHub](https://github.com/) (jika belum punya).
2. Buat repositori baru (beri nama, misalnya `celengan-couple`).
3. Unggah berkas berikut ke repositori tersebut:
   - `index.html` (berada di dalam direktori root repositori, bukan di dalam folder public)
   - `style.css` (berada di dalam direktori root)
   - `app.js` (berada di dalam direktori root)
   
   *Penting: Untuk hosting static seperti Vercel, pastikan berkas `index.html`, `style.css`, dan `app.js` berada langsung di folder utama repositori GitHub Anda (tidak di dalam folder `public`).*

### Langkah 2: Hubungkan ke Vercel
1. Buka **[Vercel.com](https://vercel.com/)** dan daftar/masuk menggunakan akun **GitHub** Anda.
2. Di dashboard Vercel, klik tombol **Add New** -> **Project**.
3. Cari repositori `celengan-couple` Anda, lalu klik **Import**.
4. Klik tombol **Deploy** (biarkan konfigurasi lainnya default).
5. Hanya dalam hitungan detik, website Anda akan aktif dan Vercel akan memberikan tautan gratis yang selalu aktif 24 jam (misalnya: `https://celengan-couple-abiyu-manda.vercel.app`).

---

## 📱 Cara Menghubungkan HP Abiyu & Manda

Setelah website aktif di Vercel:
1. **Abiyu** membuka link website tersebut di HP-nya.
2. Karena pertama kali dibuka, halaman awal akan muncul. Klik tombol **Buat Celengan Baru**.
3. Dashboard celengan akan terbuka. Klik tombol **Bagikan Kode Hubung** di bagian bawah website. Ini akan menyalin link khusus (yang sudah berisi kode hubung rahasia Anda, contoh: `https://...vercel.app/?code=6xN9d8s...`) ke clipboard HP Anda.
4. Kirim link tersebut ke WhatsApp **Manda**.
5. **Manda** cukup mengklik link tersebut di HP-nya. Browser akan terbuka dan HP Manda akan otomatis terhubung ke celengan yang sama dengan Abiyu!
6. Sekarang, setiap kali Abiyu atau Manda menambah setoran, membuat impian baru, atau mengisi tantangan, perubahan akan langsung muncul di HP pasangan dalam waktu 5 detik!

---

## 💾 Ekspor & Impor Data (Cadangan)
Untuk keamanan ekstra, gunakan tombol **Ekspor Data** di bagian bawah untuk mendownload file `.json` cadangan data Anda. Simpan file tersebut di HP Anda. Jika sewaktu-waktu database publik mengalami kendala, Anda dapat mengimpor berkas tersebut kembali untuk memulihkan seluruh saldo dan riwayat transaksi secara instan.
