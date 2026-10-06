# Plan Auto-Save Draft (Khusus Mode Edit)

Berdasarkan permintaan Anda, ini adalah rencana implementasi fitur **Auto-Save Draft** untuk halaman `RabBuilder.jsx`.

## 1. Kondisi Aktif (Khusus Edit)
Fitur auto-save hanya akan aktif jika kita sedang berada di mode **Edit** (yaitu ketika variabel `id` dari URL / parameter tersedia). Saat membuat RAB baru, auto-save tidak akan berjalan.

## 2. Cara Kerja (Logika Timer & Countdown)
Kita akan menggunakan kombinasi `useEffect` dan `useRef` di React untuk membuat custom timer (debounce) dengan countdown.
1. Setiap kali ada perubahan state/field (seperti mengubah judul, mengubah item, mengubah checkbox, dll), kita mendeteksi perubahan tersebut. Karena melacak semua field satu per satu itu rumit, kita akan memonitor payload yang dihasilkan oleh fungsi `generatePayload`. Kita bisa memanggil `generatePayload` (menggunakan `useMemo` atau `useEffect`) setiap ada render untuk mendapatkan `currentData`.
2. Jika ada perbedaan antara data yang terakhir di-save (`lastSavedData`) dan data saat ini (`currentData`), sistem akan memulai siklus:
   - Menunggu **1 detik** (idle time).
   - Setelah 1 detik berlalu tanpa perubahan, sistem memulai **countdown 5 detik**.
   - Jika dalam proses 1 detik atau 5 detik tersebut user melakukan perubahan field lagi, timer akan di-reset dari awal.
   - Jika countdown 5 detik selesai, fungsi `handleSave(true)` akan dieksekusi secara otomatis (mode background save agar toast-nya tidak mengganggu terlalu banyak, atau bisa disesuaikan).

## 3. Indikator pada Tombol (UI)
Tombol "Simpan Draft" yang saat ini memiliki kode:
```jsx
<button onClick={handleSave} disabled={isSaving} className="...">
  {isSaving ? 'Menyimpan...' : 'Simpan Draft'}
</button>
```
Akan diperbarui menjadi (kurang lebih):
```jsx
<button onClick={handleSave} disabled={isSaving} className="...">
  {isSaving 
    ? 'Menyimpan...' 
    : countdown > 0 
      ? `Auto Save dalam ${countdown}s...` 
      : 'Simpan Draft'}
</button>
```

## 4. Toast / Alert
Saat auto-save berhasil, kita akan memunculkan alert `addToast("Perubahan otomatis disimpan.", "success")` agar user tahu datanya aman, namun dibuat cukup subtle agar tidak mengganggu jika terlalu sering muncul (tergantung preferensi Anda, toast standar sudah cukup).

---

### Langkah Implementasi:
1. Tambahkan state baru: `countdown` (number, default 0), `lastSavedData` (menyimpan payload terakhir agar tidak save terus menerus jika data sama).
2. Buat `useEffect` yang memantau perubahan data (misal stringified payload). Di dalamnya ada logika `setTimeout` bertingkat dan `setInterval` untuk mengatur countdown.
3. Update `handleSave` agar bisa menerima parameter boolean `isAutoSave` untuk sedikit membedakan respon Toast-nya (contoh: "Draft otomatis disimpan" vs "Draft penawaran berhasil disimpan!").
4. Update UI tombol "Simpan Draft" di bar bagian bawah.

Jika plan ini sudah sesuai dengan yang Anda bayangkan, tolong konfirmasi dan saya akan menuliskan kodenya!
