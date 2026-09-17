# T11 — Implementasi SQLite key-value

## Tujuan
Menyediakan app database dengan tabel settings generik.

## Acceptance criteria
- [x] Direktori database dibuat otomatis.
- [x] WAL dan schema settings aktif.
- [x] `getSetting`, `setSetting`, `deleteSetting` bekerja.
- [x] Nilai JSON object/array/primitive didukung.

## Verification
- Jalankan test database temporer pada T12.

## Dependencies
T10, T06.

## Files
- `src/database/index.js`

## Scope
S — satu modul database.
