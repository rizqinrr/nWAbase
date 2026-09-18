# Implementation Plan — nWAbase

## Aturan Eksekusi

- Setiap task dikerjakan terpisah dan menghasilkan perubahan kecil.
- Setelah setiap checkpoint, berhenti untuk konfirmasi pengguna.
- Satu task tidak boleh mencampur fitur yang tidak berhubungan.
- Tidak ada commit atau push tanpa permintaan eksplisit.
- Setiap task wajib melewati acceptance criteria dan verification-nya.
- Definition of Done dari PRD berlaku untuk setiap task.

## Dependency Graph

```text
T01 docs baseline
 ├─ T02 package metadata ─ T03 folders/gitignore/license
 │                         └─ T04 env example
 ├─ T05 config parser ─ T06 config tests
 ├─ T07 utility contracts ─ T08 utility implementation ─ T09 utility tests
 ├─ T10 database contract ─ T11 database implementation ─ T12 database tests
 ├─ T13 message contract ─ T14 normalizer ─ T15 normalizer tests
 ├─ T16 plugin contract ─ T17 plugin validation ─ T18 plugin loader
 │                         └─ T19 loader tests ─ T20 atomic reload
 ├─ T21 command parser ─ T22 router ─ T23 guard checks
 │                         └─ T24 routing tests ─ T25 interactive parsing
 ├─ T26 ping plugin ─ T27 plugin dry-run
 ├─ T28 connection socket ─ T29 pairing ─ T30 reconnect
 │                         └─ T31 shutdown/error lifecycle
 ├─ T32 integration wiring ─ T33 runtime smoke test
 ├─ T34 ESLint ─ T35 TypeScript checkJs ─ T36 CI Node 20/22
 ├─ T37 README quick start ─ T38 README architecture/plugin guide
 └─ T39 security audit ─ T40 live validation/template/release prep
```

## Checkpoints

### Checkpoint A — Setelah T01–T03

- Dokumen dan repository skeleton konsisten.
- Tidak ada source runtime.
- Review manusia diperlukan sebelum config dibuat.

### Checkpoint B — Setelah T04–T06

- Env example dan config parser lulus test.
- Tidak ada secret atau nomor personal.
- Review kontrak konfigurasi.

### Checkpoint C — Setelah T07–T09

- Utilitas umum lulus unit test.
- Tidak ada dependency media/network.
- Review API utilitas.

### Checkpoint D — Setelah T10–T12

- SQLite key-value lulus test database temporer.
- Auth DB dan app DB tetap terpisah.
- Review schema/API persistence.

### Checkpoint E — Setelah T13–T15

- Pesan ternormalisasi dan helper reply teruji.
- Review bentuk objek message publik.

### Checkpoint F — Setelah T16–T20

- Loader, validasi, duplicate trigger, dan atomic reload teruji.
- Review kontrak plugin sebelum dispatcher dibangun.

### Checkpoint G — Setelah T21–T25

- Routing prefix, command, guards, dan interactive response teruji.
- Review seluruh alur command.

### Checkpoint H — Setelah T26–T27

- `ping` dapat dimuat dan dry-run.
- Review pengalaman penulis plugin.

### Checkpoint I — Setelah T28–T31

- Socket, pairing, reconnect, shutdown terisolasi dan teruji tanpa akun live.
- Review risiko operasional.

### Checkpoint J — Setelah T32–T36

- Runtime terintegrasi, smoke test, lint, typecheck, dan CI siap.
- Review final engineering.

### Checkpoint K — Setelah T37–T39

- Dokumentasi pengguna lengkap dan audit keamanan lulus.
- Review release candidate.

### Checkpoint L — Setelah T40

- Uji live dan persiapan template/release selesai.
- Persetujuan eksplisit sebelum commit/push/tag atau perubahan repository remote.

## Task Index

- [x] T01 — Bekukan baseline spesifikasi
- [x] T02 — Tetapkan metadata package
- [x] T03 — Buat folder skeleton dan aturan Git
- [x] T04 — Buat `.env.example`
- [x] T05 — Definisikan kontrak config parser
- [x] T06 — Implementasi dan test config parser
- [x] T07 — Definisikan kontrak utilitas umum
- [x] T08 — Implementasi utilitas umum
- [x] T09 — Test utilitas umum
- [x] T10 — Definisikan kontrak database aplikasi
- [x] T11 — Implementasi SQLite key-value
- [x] T12 — Test SQLite key-value
- [x] T13 — Definisikan bentuk normalized message
- [x] T14 — Implementasi message normalizer
- [x] T15 — Test message normalizer
- [x] T16 — Definisikan kontrak plugin
- [x] T17 — Implementasi validasi plugin dan trigger
- [x] T18 — Implementasi recursive plugin loader
- [x] T19 — Test plugin validation dan loader
- [x] T20 — Implementasi atomic reload dan watcher opt-in
- [x] T21 — Implementasi parser command teks
- [x] T22 — Implementasi dispatcher plugin
- [x] T23 — Implementasi owner/group/admin guards
- [x] T24 — Test routing dan guards
- [x] T25 — Implementasi interactive response routing
- [x] T26 — Tambahkan plugin contoh `ping`
- [x] T27 — Tambahkan plugin dry-run
- [x] T28 — Implementasi socket Elaina dasar
- [x] T29 — Implementasi pairing code dan QR option
- [x] T30 — Implementasi reconnect policy
- [x] T31 — Implementasi graceful shutdown dan process errors
- [x] Checkpoint I — Review connection lifecycle
- [x] T32 — Wire runtime entrypoint
- [x] T33 — Tambahkan integration smoke test
- [x] T34 — Tambahkan ESLint
- [x] T35 — Tambahkan TypeScript checkJs
- [x] T36 — Tambahkan GitHub Actions Node 20/22
- [x] Checkpoint J — Review integrated runtime and quality
- [x] T37 — Tulis README quick start dan konfigurasi
- [x] T38 — Tulis README arsitektur dan plugin guide
- [x] T39 — Audit keamanan dan hygiene repository
- [ ] T40 — Uji live, aktifkan template, dan siapkan release
