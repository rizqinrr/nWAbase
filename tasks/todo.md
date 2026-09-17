# Task Checklist — nWAbase

Status: in progress

## Cara Pakai

- Kerjakan berurutan kecuali dependency menyatakan sebaliknya.
- Selesaikan acceptance criteria dan verification sebelum mencentang task.
- Berhenti pada checkpoint dan minta konfirmasi pengguna.
- Jangan commit/push tanpa permintaan eksplisit.

## Tasks

- [x] T01 — Bekukan baseline spesifikasi (`task-01.md`)
- [x] T02 — Tetapkan metadata package (`task-02.md`)
- [x] T03 — Buat folder skeleton dan aturan Git (`task-03.md`)
- [x] Checkpoint A — Review docs dan skeleton
- [x] T04 — Buat `.env.example` (`task-04.md`)
- [x] T05 — Definisikan kontrak config parser (`task-05.md`)
- [x] T06 — Implementasi dan test config parser (`task-06.md`)
- [x] Checkpoint B — Review configuration
- [x] T07 — Definisikan kontrak utilitas umum (`task-07.md`)
- [x] T08 — Implementasi utilitas umum (`task-08.md`)
- [x] T09 — Test utilitas umum (`task-09.md`)
- [x] Checkpoint C — Review utilities
- [x] T10 — Definisikan kontrak database aplikasi (`task-10.md`)
- [x] T11 — Implementasi SQLite key-value (`task-11.md`)
- [x] T12 — Test SQLite key-value (`task-12.md`)
- [x] Checkpoint D — Review persistence
- [x] T13 — Definisikan bentuk normalized message (`task-13.md`)
- [x] T14 — Implementasi message normalizer (`task-14.md`)
- [x] T15 — Test message normalizer (`task-15.md`)
- [x] Checkpoint E — Review message API
- [ ] T16 — Definisikan kontrak plugin (`task-16.md`)
- [ ] T17 — Implementasi validasi plugin dan trigger (`task-17.md`)
- [ ] T18 — Implementasi recursive plugin loader (`task-18.md`)
- [ ] T19 — Test plugin validation dan loader (`task-19.md`)
- [ ] T20 — Implementasi atomic reload dan watcher opt-in (`task-20.md`)
- [ ] Checkpoint F — Review plugin platform
- [ ] T21 — Implementasi parser command teks (`task-21.md`)
- [ ] T22 — Implementasi dispatcher plugin (`task-22.md`)
- [ ] T23 — Implementasi owner/group/admin guards (`task-23.md`)
- [ ] T24 — Test routing dan guards (`task-24.md`)
- [ ] T25 — Implementasi interactive response routing (`task-25.md`)
- [ ] Checkpoint G — Review routing
- [ ] T26 — Tambahkan plugin contoh `ping` (`task-26.md`)
- [ ] T27 — Tambahkan plugin dry-run (`task-27.md`)
- [ ] Checkpoint H — Review example plugin
- [ ] T28 — Implementasi socket Elaina dasar (`task-28.md`)
- [ ] T29 — Implementasi pairing code dan QR option (`task-29.md`)
- [ ] T30 — Implementasi reconnect policy (`task-30.md`)
- [ ] T31 — Implementasi graceful shutdown dan process errors (`task-31.md`)
- [ ] Checkpoint I — Review connection lifecycle
- [ ] T32 — Wire runtime entrypoint (`task-32.md`)
- [ ] T33 — Tambahkan integration smoke test (`task-33.md`)
- [ ] T34 — Tambahkan ESLint (`task-34.md`)
- [ ] T35 — Tambahkan TypeScript checkJs (`task-35.md`)
- [ ] T36 — Tambahkan GitHub Actions Node 20/22 (`task-36.md`)
- [ ] Checkpoint J — Review integrated runtime and quality
- [ ] T37 — Tulis README quick start dan konfigurasi (`task-37.md`)
- [ ] T38 — Tulis README arsitektur dan plugin guide (`task-38.md`)
- [ ] T39 — Audit keamanan dan hygiene repository (`task-39.md`)
- [ ] Checkpoint K — Review release candidate
- [ ] T40 — Uji live, aktifkan template, dan siapkan release (`task-40.md`)
- [ ] Checkpoint L — Persetujuan commit/push/tag atau perubahan remote
