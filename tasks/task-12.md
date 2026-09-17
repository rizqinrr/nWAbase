# T12 — Test SQLite key-value

## Tujuan
Menguji persistence dan lifecycle database tanpa menyentuh store nyata.

## Acceptance criteria
- [x] Test create/read/update/delete setting.
- [x] Test serialisasi object dan array.
- [x] Test fallback key yang belum ada.
- [x] Test database ditutup dan file temporer dibersihkan.

## Verification
- `npm test -- tests/database.test.js`

## Dependencies
T11.

## Files
- `tests/database.test.js`

## Scope
S — satu test module.
