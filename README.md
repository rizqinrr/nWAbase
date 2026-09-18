# nWAbase

Starter bot WhatsApp minimal berbasis ESM, SQLite, dan sistem plugin. Koneksi, pairing, reconnect, normalisasi pesan, routing command, guard, hot reload, dan penyimpanan key-value tanpa fitur bisnis bawaan.

> Proyek ini tidak resmi, tidak berafiliasi dengan, tidak didukung oleh, dan bukan bagian dari WhatsApp atau Meta. Penggunaan automasi WhatsApp dapat memiliki risiko pembatasan akun; gunakan secara bertanggung jawab dan patuhi ketentuan layanan yang berlaku.

## Fitur

- **Clone and build** — siap jalan dalam empat langkah.
- **Plugin-first** — fitur ada di `plugins/`, core hanya lifecycle dan routing.
- **Pairing code default** — opsi QR tersedia tanpa mengubah source.
- **Reconnect cerdas** — capped exponential backoff, anti-koneksi paralel.
- **Hot reload opsional** — registry atomic, plugin rusak tidak merusak core.
- **Key-value SQLite** — app DB terpisah dari auth session DB.
- **Aman by default** — tanpa eval, shell, secret, atau data personal.

## Persyaratan

- Node.js 20 atau lebih baru
- npm
- Nomor WhatsApp format internasional, misalnya `62XXXXXXXXXX`

## Quick start

```powershell
# 1. Clone repository
git clone https://github.com/rizqinrr/nWAbase.git

# 2. Install dependency
npm install

# 3. Salin konfigurasi
Copy-Item .env.example .env

# 4. Jalankan bot
npm start
```

Di Linux atau macOS, gunakan `cp .env.example .env` pada langkah ketiga.

Saat sesi belum terdaftar, pairing code memakai owner pertama dari `OWNER_NUMBER`. Buka WhatsApp > Perangkat Tertaut > Tautkan Perangkat > Tautkan dengan nomor telepon, lalu masukkan kode yang muncul di terminal. Jika `OWNER_NUMBER` kosong, terminal akan meminta nomor terlebih dahulu.

Mau pakai QR? Set `USE_PAIRING_CODE=false` sebelum `npm start`.

## Konfigurasi

| Variable | Default | Keterangan |
|---|---|---|
| `BOT_NAME` | `nWAbase` | Nama bot untuk runtime. |
| `OWNER_NUMBER` | kosong | Nomor owner format internasional. Pisahkan beberapa nilai dengan koma. |
| `PREFIX` | `!` | Prefix command. Beberapa prefix dipisahkan koma, misalnya `!,#`. |
| `PAIRING_CODE` | kosong | Custom pairing code tepat 8 karakter. Jika ditolak, fallback ke kode otomatis. |
| `USE_PAIRING_CODE` | `true` | `true`/`1` pairing code, `false`/`0` QR. |
| `WATCH_PLUGINS` | `false` | Aktifkan watcher dan atomic reload plugin. |
| `SESSION_DB_PATH` | `./store/session.db` | SQLite khusus auth state WhatsApp. |
| `APP_DB_PATH` | `./store/app.db` | SQLite key-value aplikasi. |

Jangan commit `.env`, isi `store/`, database session, log, token, atau credential.

## Commands

| Command | Fungsi |
|---|---|
| `npm start` | Menjalankan runtime bot. |
| `npm test` | Menjalankan seluruh test. |
| `npm run test:plugins` | Dry-run validasi semua plugin. |
| `npm run lint` | Menjalankan ESLint. |
| `npm run typecheck` | Memeriksa JavaScript dengan TypeScript `checkJs`. |

## Plugin pertama

Buat file `.js` di dalam `plugins/`, misalnya `plugins/example/hello.js`:

```js
export default {
  name: 'hello',
  command: 'hello',
  alias: ['hi'],
  category: 'example',
  description: 'Contoh plugin sederhana',
  async execute(message, context) {
    await message.reply(`Hello! Prefix aktif: ${context.prefix}`)
  }
}
```

**Field wajib**

- `command` — string atau array string non-kosong.
- `execute(message, context)` — function yang menjalankan plugin.

**Metadata opsional**

- `name`, `alias`/`aliases`, `category`, `description`
- Guard: `ownerOnly`, `groupOnly`, `privateOnly`, `adminOnly`, `botAdminOnly`
- Behavior: `typing`, `wait`

**Context eksekusi**

`sock`, `args`, `text`, `command`, `prefix`, `isOwner`, `settings`, `utils`.

Contoh pemakaian guard:

```js
export default {
  command: 'admin-only',
  groupOnly: true,
  adminOnly: true,
  botAdminOnly: true,
  async execute(message) {
    await message.reply('Sender dan bot adalah admin grup.')
  }
}
```

Command teks memerlukan prefix, misalnya `!ping`. Respons interactive/button dirutekan sebagai command tanpa prefix. Command dan alias dinormalisasi ke lowercase; trigger kosong atau duplikat ditolak saat load.

Jalankan `npm run test:plugins` setelah menambah plugin. Dengan `WATCH_PLUGINS=true`, perubahan dipindai ulang dan registry hanya diganti jika seluruh kandidat valid.

## Arsitektur

```text
src/index.js              entrypoint dan lifecycle runtime
src/config.js             parser environment tervalidasi
src/core/connection.js    socket, pairing, reconnect, shutdown
src/core/message.js       normalisasi pesan WhatsApp
src/core/handler.js       parser, guard, dispatcher
src/core/plugins.js       loader, registry, atomic reload
src/database/index.js     SQLite key-value aplikasi
src/utils/index.js        helper umum
plugins/                  fitur bot
scripts/test-plugins.js   dry-run plugin
tests/                    unit dan integration test
```

Alur pesan:

```text
Elaina socket -> messages.upsert -> normalizeMessage -> routeMessage -> guard -> plugin.execute
```

Auth database (`SESSION_DB_PATH`) dan app database (`APP_DB_PATH`) sengaja dipisah. Core tidak memiliki media converter, scraper, AI, scheduler, moderation suite, premium system, `eval`, atau shell.

## Lifecycle proses

- `SIGINT` dan `SIGTERM` memicu graceful shutdown idempotent.
- Socket, auth DB, watcher plugin, dan app DB ditutup secara independen.
- Disconnect non-logout memakai capped exponential backoff tanpa reconnect paralel.
- Logout tidak memicu reconnect.
- `uncaughtException` dan `unhandledRejection` dicatat dengan pesan generik tanpa payload error sensitif.

## Keamanan

- Jangan menambahkan plugin remote `eval` atau shell.
- Perlakukan pesan, interactive payload, dan metadata WhatsApp sebagai input tidak tepercaya.
- Gunakan guard plugin untuk command terbatas.
- Jalankan `npm audit --audit-level=high` sebelum release.
- Jika session database bocor, anggap sesi terkompromi: logout perangkat tertaut dan pairing ulang.

## Distribusi dan lisensi

nWAbase ditujukan sebagai GitHub Template dan tidak dipublikasikan ke npm pada MVP. Engine WhatsApp menggunakan [`@rexxhayanasi/elaina-baileys`](https://www.npmjs.com/package/@rexxhayanasi/elaina-baileys), distribusi independen berbasis Baileys.

Lisensi: [MIT](LICENSE).
