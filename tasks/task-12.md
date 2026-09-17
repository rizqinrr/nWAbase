# T12 — Test SQLite key-value

## Tujuan
Menguji persistence dan lifecycle database tanpa menyentuh store nyata.

## Acceptance criteria
- [ ] Test create/read/update/delete setting.
- [ ] Test serialisasi object dan array.
- [ ] Test fallback key yang belum ada.
- [ ] Test database ditutup dan file temporer dibersihkan.

## Verification
- `npm test -- tests/database.test.js`

## Dependencies
T11.

## Files
- `tests/database.test.js`

## Scope
S — satu test module.
