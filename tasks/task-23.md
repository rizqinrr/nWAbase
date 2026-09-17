# T23 — Owner/group/admin guards

## Tujuan
Menerapkan metadata access guard tanpa premium/trusted system.

## Acceptance criteria
- [x] Owner number dinormalisasi dan dibandingkan aman.
- [x] `ownerOnly`, `groupOnly`, dan `privateOnly` bekerja.
- [x] `adminOnly` dan `botAdminOnly` memeriksa metadata async.
- [x] Denial message tidak membocorkan data internal.

## Verification
- Test menggunakan fake socket/group metadata.

## Dependencies
T22.

## Files
- `src/core/handler.js`
- `tests/guards.test.js`

## Scope
M — guard logic.
