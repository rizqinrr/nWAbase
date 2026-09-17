# T06 — Implementasi dan test config parser

## Tujuan
Membaca `.env` dan menghasilkan settings tervalidasi.

## Acceptance criteria
- [x] List comma-separated diparse dan whitespace dibersihkan.
- [x] Boolean hanya menerima nilai yang ditentukan.
- [x] Input invalid menghasilkan error yang dapat ditindaklanjuti.
- [x] Test mencakup default dan override.

## Verification
- `npm test -- tests/config.test.js`

## Dependencies
T05.

## Files
- `src/config.js`
- `tests/config.test.js`

## Scope
S — satu modul dan test.
