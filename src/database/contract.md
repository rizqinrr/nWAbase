# Database Contract

`src/database/index.js` mengelola app database SQLite yang terpisah dari auth database.

```js
export function initDB(dbPath)
export function getDB()
export function closeDB()
export function getSetting(key, fallback)
export function setSetting(key, value)
export function deleteSetting(key)
```

Aturan kontrak:

- `initDB(dbPath)` membuka database SQLite pada path yang diberikan, membuat direktori induk secara otomatis, mengaktifkan mode WAL, lalu membuat tabel:

```sql
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
```

- `getDB()` mengembalikan instance database aktif; jika belum diinisialisasi, melempar error yang jelas.
- `closeDB()` menutup database dan mengosongkan state agar panggilan `getDB()` berikutnya melempar error sampai `initDB()` dipanggil lagi.
- `setSetting(key, value)` menyimpan nilai sebagai string JSON; key kosong atau bukan string melempar error.
- `getSetting(key, fallback)` membaca key, mem-parse JSON, dan mengembalikan `fallback` ketika key tidak ada.
- `deleteSetting(key)` menghapus key dan mengembalikan `true` hanya jika ada baris yang terhapus.
- Nilai primitive, object, dan array didukung melalui serialisasi JSON.
- Schema hanya menyediakan tabel generik `settings`; tidak ada tabel bisnis.
- Test menggunakan database di direktori temporer dan membersihkan artefak setelah selesai.
