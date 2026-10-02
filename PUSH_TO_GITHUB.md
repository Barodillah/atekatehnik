# Aturan Standar: Git Commit & Push (Ateka Tehnik)

Ketika pengguna meminta Anda untuk melakukan "Push ke GitHub" atau mengeksekusi proses Git, Anda **WAJIB** mengikuti panduan instruksi di bawah ini dengan akurat:

## 1. Keamanan Data (Penting!)
- **Abaikan `.env`**: Selalu pastikan file `.env`, kredensial, atau kunci API apa pun (seperti `MAIL_PASSWORD`, `VITE_OPENROUTER_API_KEY`) **TIDAK** ikut dimasukkan ke dalam panggung commit (staging). Pastikan `.gitignore` sudah bekerja dengan benar.

## 2. Penyusunan Pesan Commit
Anda harus menyusun pesan commit yang terdiri dari **Judul** dan **Deskripsi Detail**.

### A. Judul Commit
Format wajib: `[LOKASI] DD/MM/YYYY HH:MM`
- **Lokasi**: Gunakan `PC KANTOR` atau `PC RUMAH`. Jika Anda tidak yakin atau pengguna tidak memberitahu konteksnya, bertanyalah terlebih dahulu.
- **Tanggal & Waktu**: Deteksi tanggal dan jam Anda saat ini secara otomatis (gunakan format lokal 24 jam). 
  - *Contoh Judul:* `[PC RUMAH] 03/10/2026 15:38`

### B. Deskripsi Commit
Rangkum secara mendetail dan akurat seluruh pekerjaan yang telah dilakukan di sesi tersebut.
- **Wajib menggunakan Bahasa Indonesia** yang baik, jelas, dan rapi.
- Gunakan format *bullet points* (poin-poin) untuk memisahkan setiap fitur, penambahan, atau perbaikan bug.
- Sebutkan nama-nama komponen atau file yang diubah (misalnya `Gallery.jsx`, `posts.php`, `AdminGallery.jsx`).

## 3. Eksekusi Git (CLI)
Lakukan eksekusi berurutan menggunakan eksekusi terminal (bash/pwsh):
1. `git status` (untuk meninjau kembali apa saja yang akan dipush).
2. `git add .` (tambahkan pengecualian spesifik jika diperlukan).
3. `git commit -m "Judul Commit" -m "1. Perubahan A... 2. Perubahan B..."`
4. `git push`

**Contoh Skrip Terminal yang Diharapkan:**
```bash
git add .
git commit -m "[PC RUMAH] 03/10/2026 15:45" -m "
- Memperbaiki bug infinite scroll pada Gallery.jsx
- Mengubah batasan limit fetch di posts.php dari 50 menjadi 1000
- Menambahkan modal preview gambar/video pada AdminGallery.jsx
- Menambahkan fitur autoPlay khusus iOS pada FloatingVideo"
git push
```