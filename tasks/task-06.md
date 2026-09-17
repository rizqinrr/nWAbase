# T06 — Implementasi dan test config parser

## Tujuan
Membaca `.env` dan menghasilkan settings tervalidasi.

## Acceptance criteria
- [ ] List comma-separated diparse dan whitespace dibersihkan.
- [ ] Boolean hanya menerima nilai yang ditentukan.
- [ ] Input invalid menghasilkan error yang dapat ditindaklanjuti.
- [ ] Test mencakup default dan override.

## Verification
- `npm test -- tests/config.test.js`

## Dependencies
T05.

## Files
- `src/config.js`
- `tests/config.test.js`

## Scope
S — satu modul dan test.
