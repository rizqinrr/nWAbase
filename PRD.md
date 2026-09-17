# PRD — nWAbase

## Status Dokumen

- Status: Draft untuk review
- Versi produk: 0.1.0
- Tanggal: 17 September 2026
- Repository: `rizqinrr/nWAbase`
- Lisensi: MIT

## Ringkasan

nWAbase adalah starter minimal open-source untuk membangun bot WhatsApp berbasis ESM. Proyek ini menyediakan fondasi yang stabil, mudah dipahami, dan mudah dikembangkan: koneksi WhatsApp, autentikasi SQLite, message handler, plugin loader, konfigurasi berbasis environment, utilitas umum, dan penyimpanan SQLite generik.

Fondasi nWAbase merupakan ekstraksi terkurasi dari `bot-wa` dan pembelajaran dari koleksi `bot-wa-compare`. Arsitektur modern `bot-wa` menjadi acuan utama, sedangkan pola yang berguna dari proyek pembanding hanya diadopsi sebagai ide dan ditulis ulang. Kode pembanding tidak disalin langsung.

## Masalah

Banyak base bot WhatsApp membawa terlalu banyak fitur, dependency, konfigurasi personal, dan pola lama. Pengguna harus membuang banyak kode sebelum dapat membangun bot sesuai kebutuhannya. nWAbase menyelesaikan masalah tersebut dengan menyediakan titik awal yang kecil, aman, modular, dan siap dikembangkan.

## Target Pengguna

- Developer JavaScript yang ingin membuat bot WhatsApp baru.
- Pengguna yang membutuhkan base ESM dengan sistem plugin tanpa fitur bisnis bawaan.
- Kontributor open-source yang membutuhkan kontrak plugin dan struktur proyek yang konsisten.

## Tujuan Produk

1. Pengguna dapat menjalankan bot dari clone baru dengan konfigurasi minimal.
2. Pengguna dapat pairing melalui pairing code, dengan QR sebagai opsi.
3. Pengguna dapat menjalankan plugin contoh `ping`.
4. Pengguna dapat menambahkan plugin tanpa mengubah core.
5. Pengguna dapat menyimpan konfigurasi runtime sederhana di SQLite.
6. Core tetap kecil, aman, dan bebas dari data maupun fitur personal.

## Ruang Lingkup MVP

### 1. Runtime dan Modul

- Node.js `>=20`.
- JavaScript ESM murni dengan `"type": "module"`.
- Package manager `npm`.
- Nama display `nWAbase`.
- Nama package `nwabase`.
- Versi awal `0.1.0`.

### 2. Engine WhatsApp

- Engine: `@rexxhayanasi/elaina-baileys`.
- Auth state menggunakan SQLite melalui API engine.
- Pairing code menjadi mode default.
- QR dapat diaktifkan melalui konfigurasi.
- Nomor pairing menggunakan nomor owner pertama dari environment; jika kosong, terminal meminta input secara interaktif.
- Custom pairing code bersifat opsional; jika ditolak engine, gunakan pairing code otomatis.

### 3. Lifecycle Koneksi

- Membuka socket WhatsApp dengan logger Pino.
- Menyimpan pembaruan credentials.
- Menangani pesan melalui event `messages.upsert`.
- Exponential reconnect dengan batas maksimum delay.
- Tidak reconnect ketika sesi berstatus logout.
- Graceful shutdown pada `SIGINT` dan `SIGTERM`.
- Global handler untuk `uncaughtException` dan `unhandledRejection`.
- Tidak mencetak credentials atau data sensitif ke log.

### 4. Normalisasi Pesan

Message normalizer menyediakan minimal:

- `id`, `chat`, `sender`, `fromMe`, dan `isGroup`.
- Tipe pesan dan teks/caption.
- Mention dan quoted message.
- Status admin sender dan bot secara lazy.
- Helper `reply` untuk payload teks dan objek pesan.
- Parsing interactive/button response menjadi command ID tanpa prefix.

### 5. Routing Command

- Command teks biasa wajib menggunakan prefix.
- Prefix mendukung satu atau beberapa nilai.
- Command dan trigger diproses case-insensitive.
- Interactive/button response dapat dirutekan tanpa prefix.
- `customPrefix` tidak termasuk MVP.
- Pesan non-command diabaikan oleh core.

### 6. Kontrak Plugin

Plugin menggunakan default export berbentuk objek:

```js
export default {
  name: 'ping',
  command: ['ping'],
  category: 'example',
  description: 'Memeriksa status bot',
  ownerOnly: false,
  async execute(m, context) {
    await m.reply('Pong!')
  }
}
```

Kontrak minimum:

- `command`: string atau array string yang tidak kosong.
- `execute`: async function.

Metadata opsional:

- `name`
- `alias` atau `aliases`
- `category`
- `description`
- `ownerOnly`
- `groupOnly`
- `privateOnly`
- `adminOnly`
- `botAdminOnly`
- `typing`
- `wait`

Context eksekusi minimal:

- `sock`
- `args`
- `text`
- `command`
- `prefix`
- `isOwner`
- `settings`
- `utils`

### 7. Plugin Loader

- Memindai file `.js` dalam `plugins/` secara rekursif.
- Mendukung command dan alias.
- Memvalidasi kontrak sebelum registrasi.
- Plugin invalid dilewati dan menghasilkan error yang jelas.
- Trigger duplikat ditolak.
- Registry kandidat dibangun terpisah lalu ditukar secara atomik agar reload tidak meninggalkan state parsial.
- Hot reload hanya aktif jika `WATCH_PLUGINS=true`.
- Production default hanya memuat plugin saat startup.

### 8. Guard Bawaan

Dispatcher mendukung:

- `ownerOnly`
- `groupOnly`
- `privateOnly`
- `adminOnly`
- `botAdminOnly`

MVP tidak memiliki konsep premium user atau trusted user. Daftar owner dibaca dari environment dan dinormalisasi menjadi JID WhatsApp.

### 9. Konfigurasi

`.env.example` menjadi template konfigurasi. File `src/config.js` membaca environment dan mengekspor objek settings dengan default aman.

| Variable | Bentuk | Default |
|---|---|---|
| `BOT_NAME` | string | `nWAbase` |
| `OWNER_NUMBER` | comma-separated | kosong |
| `PREFIX` | comma-separated | `!` |
| `PAIRING_CODE` | string opsional | kosong/otomatis |
| `USE_PAIRING_CODE` | boolean | `true` |
| `WATCH_PLUGINS` | boolean | `false` |
| `SESSION_DB_PATH` | path | `./store/session.db` |
| `APP_DB_PATH` | path | `./store/app.db` |

Aturan konfigurasi:

- `.env` tidak boleh masuk Git.
- `OWNER_NUMBER` dan `PREFIX` diparse dari comma-separated values.
- Tidak ada nomor telepon personal atau credential default.
- Boolean env divalidasi secara eksplisit.
- Konfigurasi invalid harus gagal dengan pesan yang dapat ditindaklanjuti.

### 10. SQLite Aplikasi

Database auth dan database aplikasi dipisahkan:

- `session.db`: auth state Elaina.
- `app.db`: data aplikasi generik.

API publik database aplikasi:

- `initDB()`
- `getDB()`
- `closeDB()`
- `getSetting(key, fallback?)`
- `setSetting(key, value)`
- `deleteSetting(key)`

Schema MVP:

```sql
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
```

Nilai disimpan sebagai JSON string dan diparse otomatis ketika dibaca, sehingga primitive, object, dan array didukung.

### 11. Utilitas Umum

Utilitas MVP:

- Normalisasi JID/nomor telepon.
- Parse mention.
- Helper target dari mention/reply/nomor bila diperlukan guard.
- `sleep`.
- Formatter uptime/durasi.
- Message normalizer dan helper `reply`.

Utilitas media, HTTP downloader, converter, scraper, dan integrasi AI tidak masuk MVP.

### 12. Plugin Contoh

MVP menyertakan satu plugin `plugins/example/ping.js` yang:

- Menggunakan kontrak plugin resmi nWAbase.
- Membalas status aktif dan uptime proses.
- Tidak memerlukan dependency tambahan.
- Menjadi contoh paling kecil untuk membuat plugin baru.

## Arsitektur Proyek

```text
nWAbase/
├── src/
│   ├── index.js
│   ├── config.js
│   ├── core/
│   │   ├── connection.js
│   │   ├── handler.js
│   │   ├── message.js
│   │   └── plugins.js
│   ├── database/
│   │   └── index.js
│   └── utils/
│       └── index.js
├── plugins/
│   └── example/
│       └── ping.js
├── tests/
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── PRD.md
├── GOALS.md
└── LICENSE
```

## Dependency MVP

Dependency runtime dibatasi pada:

- `@rexxhayanasi/elaina-baileys`
- `@hapi/boom`
- `better-sqlite3`
- `pino`
- `chalk`
- `dotenv`

Dependency seperti Sharp, Jimp, FFmpeg, Axios, cron, dan Moment tidak termasuk MVP.

## Commands

| Command | Fungsi |
|---|---|
| `npm install` | Memasang dependency |
| `npm start` | Menjalankan bot |
| `npm run dev` | Menjalankan bot dengan watcher plugin melalui environment development |
| `npm test` | Menjalankan seluruh test dengan `node:test` |
| `npm run test:plugins` | Dry-run validasi plugin |
| `npm run lint` | Memeriksa syntax/style menggunakan tooling proyek |
| `npm run typecheck` | Memeriksa tipe JavaScript melalui `tsc --noEmit` bila dikonfigurasi |

Command final harus sesuai script yang benar-benar tersedia pada implementasi. MVP tidak dianggap selesai jika dokumentasi menyebut command yang tidak dapat dijalankan.

## Strategi Pengujian

- Test runner: bawaan Node.js `node:test`.
- Unit test untuk parser konfigurasi, utilitas, plugin validation, routing, dan SQLite settings.
- Dry-run memastikan plugin contoh dapat dimuat dan jumlah trigger sesuai ekspektasi.
- Test koneksi menggunakan dependency injection atau mock; test otomatis tidak memerlukan akun WhatsApp aktif.
- GitHub Actions menjalankan test pada Node.js 20 dan 22.
- Live pairing dari HP menjadi verifikasi manual setelah automated checks lulus.

## Persyaratan Nonfungsional

### Keamanan

- Tidak ada API key, nomor personal, session database, atau credential dalam repository.
- Tidak menyediakan plugin `eval` atau `shell`.
- Error publik tidak membocorkan credential atau internal auth state.
- File `.env`, `store/`, dan seluruh variasi file SQLite diabaikan Git.

### Maintainability

- Core dan plugin dipisahkan dengan kontrak eksplisit.
- Dependency seminimal mungkin.
- Tidak ada fitur bisnis di core.
- Error plugin terisolasi agar tidak menghentikan proses utama.

### Reliability

- Reconnect menggunakan backoff dan tidak membuat koneksi paralel.
- Shutdown menutup socket, watcher, readline, dan database.
- Reload plugin tidak merusak registry aktif.

### Portability

- Mendukung Windows dan Linux dengan Node.js 20/22.
- Path dibuat melalui API `path`, bukan separator hardcoded.

## Di Luar Ruang Lingkup MVP

- Media converter, sticker, image enhancement, dan FFmpeg.
- AI, summarizer, scraper, scheduler, dan chat archive.
- Anti-link dan moderation suite.
- CRM, notes, dan fitur bisnis.
- Group management commands.
- Premium/trusted user system.
- Eval dan shell dari WhatsApp.
- Native album dan interactive message sender.
- Dashboard web, REST API, multi-tenant, dan deployment automation.
- Publikasi package npm; distribusi awal melalui GitHub Template.

Interactive response parsing tetap masuk karena merupakan fondasi routing, tetapi nWAbase MVP tidak menyediakan builder/sender tombol interaktif.

## Batas Pengembangan

### Selalu Dilakukan

- Menjaga core tetap minimal.
- Menjalankan test, lint, dan typecheck yang tersedia sebelum perubahan dinyatakan selesai.
- Memvalidasi input konfigurasi dan plugin.
- Menjaga `.env` dan SQLite session di luar Git.
- Memperbarui PRD jika scope atau kontrak berubah.

### Harus Meminta Persetujuan

- Menambah dependency runtime.
- Mengubah kontrak plugin publik.
- Menambah tabel bisnis ke database starter.
- Menambah fitur di luar ruang lingkup MVP.
- Mengubah engine WhatsApp.

### Tidak Pernah Dilakukan

- Menyimpan secret atau session pengguna ke repository.
- Menyalin kode pembanding tanpa lisensi dan atribusi yang jelas.
- Menambahkan fitur berbahaya seperti remote eval/shell ke starter default.
- Commit atau push tanpa permintaan eksplisit pengguna.

## Kriteria Penerimaan MVP

MVP diterima jika seluruh kondisi berikut terpenuhi:

1. Repository dapat di-clone pada Windows atau Linux dengan Node.js 20/22.
2. `npm install` selesai tanpa dependency yang tidak masuk scope.
3. Pengguna dapat menyalin `.env.example` menjadi `.env` dan menjalankan `npm start`.
4. Bot dapat pairing menggunakan code; QR tersedia sebagai opsi.
5. Bot reconnect secara terkendali setelah koneksi non-logout terputus.
6. Command `!ping` membalas status dan uptime.
7. Plugin baru dapat ditambahkan mengikuti satu contoh tanpa mengubah core.
8. Seluruh guard plugin bekerja sesuai metadata.
9. Interactive response dapat dirutekan sebagai command tanpa prefix.
10. `setSetting`, `getSetting`, dan `deleteSetting` lulus test menggunakan SQLite temporer.
11. Plugin invalid atau trigger duplikat tidak menghasilkan registry parsial.
12. `npm test`, `npm run test:plugins`, `npm run lint`, dan `npm run typecheck` lulus jika script tersebut tersedia.
13. GitHub Actions lulus pada Node.js 20 dan 22.
14. Git status tidak memuat `.env`, session, database, log, atau credential.
15. README mendokumentasikan quick start, struktur, kontrak plugin, konfigurasi, commands, dan disclaimer unofficial WhatsApp bot.

## Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Perubahan API pada fork Baileys | Isolasi seluruh integrasi engine dalam `src/core/connection.js` dan `src/core/message.js` |
| Native dependency `better-sqlite3` gagal terpasang | Dokumentasikan versi Node yang didukung dan langkah rebuild khusus platform |
| Hot reload meninggalkan state parsial | Bangun registry kandidat dan swap atomik setelah validasi |
| Reconnect berulang atau paralel | Gunakan lock koneksi, generation token, dan capped exponential backoff |
| Starter kembali membesar | Terapkan daftar non-goals dan review setiap dependency/fitur baru terhadap tujuan minimal |
| Pola dari source pembanding tidak jelas lisensinya | Gunakan sebagai referensi konsep saja; implementasi ditulis ulang |

## Distribusi

- Repository publik GitHub.
- Ditujukan untuk diaktifkan sebagai GitHub Template.
- Tidak dipublikasikan ke npm pada MVP.
- Release awal direncanakan sebagai `v0.1.0` setelah seluruh acceptance criteria terpenuhi.

## Pertanyaan Terbuka

Tidak ada pertanyaan produk yang memblokir MVP. Perubahan setelah dokumen disetujui harus dicatat sebagai revisi PRD.
