# GOALS — nWAbase

## Visi

Menjadi starter bot WhatsApp open-source yang minimal, aman, dan mudah dipahami, sehingga developer dapat memulai dari fondasi yang sehat tanpa harus membersihkan fitur, dependency, data, dan konfigurasi milik bot lain.

## Prinsip Produk

1. **Minimal by default** — hanya fondasi yang hampir selalu dibutuhkan.
2. **Plugin-first** — fitur bot berada di plugin, bukan menumpuk di core.
3. **Safe by default** — tidak membawa secret, session, eval, shell, atau nomor personal.
4. **Explicit over magical** — kontrak, konfigurasi, guard, dan error mudah dilacak.
5. **Stable core, flexible edges** — engine dan lifecycle terisolasi; plugin bebas berkembang.
6. **Clone and build** — distribusi sebagai GitHub Template, bukan framework abstrak yang sulit dimodifikasi.

## Sasaran Utama

### G1 — Onboarding Cepat

Developer baru dapat berpindah dari clone ke bot terhubung tanpa memahami seluruh implementasi core.

**Indikator sukses:**

- Quick start maksimal empat langkah: clone, install, salin env, start.
- `.env.example` menjelaskan seluruh konfigurasi wajib.
- Bot memberi error yang dapat ditindaklanjuti ketika konfigurasi tidak valid.
- Pengguna dapat pairing tanpa mengedit source code.

### G2 — Core Kecil dan Terbaca

Core hanya menangani koneksi, normalisasi pesan, routing, plugin lifecycle, konfigurasi, dan SQLite generik.

**Indikator sukses:**

- Tidak ada fitur bisnis di `src/core/`.
- Dependency runtime hanya yang disetujui PRD.
- Integrasi engine terisolasi dari plugin.
- Developer dapat menemukan alur pesan dari socket ke plugin dengan struktur yang jelas.

### G3 — Ekstensi Plugin yang Konsisten

Developer dapat menambah fitur baru dengan menyalin pola plugin contoh tanpa mengubah handler atau plugin loader.

**Indikator sukses:**

- Satu kontrak plugin terdokumentasi dan divalidasi saat load.
- Command, alias, context, serta guard memiliki perilaku konsisten.
- Plugin invalid tidak menjatuhkan proses utama.
- Hot reload opsional tidak menghasilkan registry parsial.

### G4 — Data Lokal yang Sederhana

Starter menyediakan penyimpanan lokal generik tanpa memaksakan domain bisnis tertentu.

**Indikator sukses:**

- Auth database dan app database terpisah.
- API key-value mendukung primitive, object, dan array.
- Database dibuat otomatis di lokasi yang dikonfigurasi.
- Test SQLite menggunakan database temporer dan tidak meninggalkan artefak.

### G5 — Operasi yang Stabil

Bot dapat berjalan lama dan pulih dari gangguan koneksi umum secara terkendali.

**Indikator sukses:**

- Reconnect memakai capped exponential backoff.
- Tidak ada koneksi paralel akibat event close berulang.
- Logout tidak memicu reconnect tanpa akhir.
- Graceful shutdown menutup seluruh resource.
- Error plugin terisolasi dari event loop utama.

### G6 — Fondasi Open-source yang Aman

Repository siap digunakan publik tanpa membocorkan data pembuat atau mendorong pola berisiko.

**Indikator sukses:**

- Tidak ada secret, nomor personal, session, database runtime, atau log dalam Git.
- Tidak ada plugin eval/shell bawaan.
- Lisensi MIT tersedia.
- README menyertakan atribusi dependency dan disclaimer bahwa proyek tidak berafiliasi dengan WhatsApp.

## Milestone

### M0 — Specification Baseline

**Output:**

- `PRD.md` disetujui.
- `GOALS.md` disetujui.
- Scope MVP, non-goals, kontrak plugin, dan definition of done terkunci.

**Exit criteria:** Tidak ada keputusan produk yang masih ambigu atau memblokir implementasi.

### M1 — Project Skeleton

**Output:**

- Struktur `src/`, `plugins/`, dan `tests/`.
- `package.json` versi `0.1.0`.
- `.env.example`, `.gitignore`, dan MIT `LICENSE`.
- Parser konfigurasi tervalidasi.

**Exit criteria:** Install dependency berhasil dan konfigurasi dapat diuji tanpa koneksi WhatsApp.

### M2 — Core Runtime

**Output:**

- Connection lifecycle Elaina.
- SQLite auth state.
- Reconnect, shutdown, dan global error handlers.
- Message normalizer dan routing dasar.

**Exit criteria:** Runtime dapat mulai sampai tahap pairing dan test core lulus dengan mock.

### M3 — Plugin Platform

**Output:**

- Recursive plugin loader.
- Atomic registry reload.
- Dispatcher dan guard.
- Interactive response routing.
- Plugin contoh `ping`.

**Exit criteria:** Dry-run memuat tepat satu plugin contoh dan seluruh trigger yang diharapkan; `!ping` lolos test dispatcher.

### M4 — Generic Persistence

**Output:**

- SQLite app database.
- Tabel `settings`.
- `getSetting`, `setSetting`, dan `deleteSetting`.

**Exit criteria:** Operasi CRUD dan serialisasi JSON lulus test pada database temporer.

### M5 — Quality and Documentation

**Output:**

- Test suite `node:test`.
- Lint dan typecheck JavaScript.
- GitHub Actions untuk Node.js 20 dan 22.
- README quick start, architecture, plugin guide, dan configuration reference.

**Exit criteria:** Seluruh command dokumentasi dapat dijalankan dan CI hijau.

### M6 — Live Validation and v0.1.0

**Output:**

- Pairing live dari HP.
- Verifikasi `!ping` di private chat dan grup.
- GitHub Template diaktifkan.
- Release `v0.1.0` siap dibuat.

**Exit criteria:** Seluruh acceptance criteria PRD terpenuhi dan tidak ada data sensitif di diff/repository.

## Definition of Success

nWAbase berhasil sebagai MVP ketika seorang developer yang belum mengenal source asal dapat:

1. Membuat repository baru dari template.
2. Mengisi konfigurasi tanpa mengedit core.
3. Pairing dan menjalankan bot.
4. Menggunakan `!ping`.
5. Menyimpan dan membaca setting SQLite.
6. Membuat plugin baru dari contoh.
7. Menjalankan seluruh quality checks secara lokal dan di CI.

## Non-goals

nWAbase versi 0.1.0 tidak bertujuan menjadi bot siap pakai dengan puluhan fitur. Secara khusus, versi ini tidak mengejar:

- Kelengkapan command.
- AI dan otomatisasi bisnis.
- Media processing.
- Moderasi grup lengkap.
- Native album/button sender.
- Dashboard atau API server.
- Multi-tenant hosting.
- Kompatibilitas dengan banyak engine Baileys sekaligus.
- Publikasi package npm.

Fitur-fitur tersebut dapat menjadi plugin atau roadmap terpisah setelah fondasi terbukti stabil.

## Guardrails Scope

Proposal fitur baru hanya masuk core jika memenuhi seluruh syarat berikut:

1. Dibutuhkan oleh hampir semua bot turunan.
2. Tidak lebih tepat ditempatkan sebagai plugin.
3. Tidak menambah risiko keamanan default.
4. Biaya dependency dan maintenance sebanding dengan manfaatnya.
5. Memiliki acceptance criteria dan test otomatis.

Jika satu syarat tidak terpenuhi, fitur harus berada di plugin, contoh terpisah, atau di luar proyek.

## Arah Setelah MVP

Urutan evaluasi setelah `v0.1.0`:

1. Umpan balik pengguna template pertama.
2. Stabilitas live connection dan plugin reload.
3. Contoh plugin tambahan di repository terpisah atau branch examples.
4. Evaluasi helper native interactive buttons dan album tanpa mengganti engine.
5. Panduan deployment VPS.

Semua item pasca-MVP membutuhkan keputusan scope baru dan tidak menjadi blocker rilis awal.
