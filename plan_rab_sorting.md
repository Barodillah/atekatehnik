# Plan Update Urutan Rincian Item RAB (RabBuilder.jsx)

Berdasarkan permintaan Anda, ini adalah rencana (plan) untuk memperbarui fitur urutan item di RAB:

## 1. Auto-Sorting (Naik jika dicentang, Turun jika tidak)
Kita akan memodifikasi fungsi `updateItem` di `RabBuilder.jsx`. Saat checkbox `showOnCover` diubah:
- Item yang **dicentang** (`true`) akan otomatis diprioritaskan dan naik ke kelompok atas.
- Item yang **tidak dicentang** (`false`) akan otomatis turun ke kelompok bawah.
- *Logika teknis:* Kita akan menggunakan metode sorting `array.sort()` yang stabil berdasarkan properti `showOnCover` setiap kali properti tersebut diubah.

## 2. Fitur Pindah Posisi Manual (Up & Down / Drag)
Agar UX optimal dan tidak perlu menginstall *library* pihak ketiga yang berat (seperti `react-beautiful-dnd`), pendekatan terbaik adalah menambahkan tombol **Naik (↑)** dan **Turun (↓)** di samping tombol Hapus (tong sampah) pada setiap baris item.
- **UX:** Tombol Up/Down jauh lebih mudah digunakan pada perangkat mobile/tablet dibanding drag-and-drop murni.
- *Logika teknis:* Membuat fungsi `moveItem(index, direction)` yang akan menukar posisi item di dalam array `items` React state berdasarkan klik pengguna.

## 3. Apakah perlu update di Database?
**Tidak Perlu / Tergantung Backend API Anda.**
Saat data disimpan (`generatePayload`), seluruh daftar `items` dikirim dalam format *Array JSON*. Urutan array ini sudah mencerminkan posisi terbaru (hasil drag & drop atau auto-sort).
- Jika API `/api/quotations.php` Anda bekerja dengan cara **menghapus semua item lama lalu melakukan insert ulang** item baru dari JSON, maka urutan akan otomatis tersimpan berdasarkan urutan *Auto Increment ID* di database (secara natural tanpa perlu menambah kolom `sort_order`).
- *Catatan:* Selama backend merespek urutan iterasi dari array JSON, Anda tidak perlu mengubah skema database sama sekali.

---

Jika plan ini sesuai dengan keinginan Anda, silakan konfirmasi dan saya akan langsung mengimplementasikan kodenya ke file `RabBuilder.jsx`!
