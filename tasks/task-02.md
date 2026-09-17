# T02 — Tetapkan metadata package

## Tujuan
Menetapkan metadata npm untuk starter `nwabase` versi `0.1.0`.

## Acceptance criteria
- [x] `package.json` memakai `name: nwabase`, `version: 0.1.0`, dan `type: module`.
- [x] Engine Elaina tercantum sebagai dependency.
- [x] Script awal hanya mendokumentasikan command yang tersedia.

## Verification
- `node -e "const p=require('./package.json'); if(p.name!=='nwabase'||p.type!=='module') process.exit(1)"`

## Dependencies
T01.

## Files
- `package.json`

## Scope
S — satu file konfigurasi.
