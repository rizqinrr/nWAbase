# T23 — Owner/group/admin guards

## Tujuan
Menerapkan metadata access guard tanpa premium/trusted system.

## Acceptance criteria
- [ ] Owner number dinormalisasi dan dibandingkan aman.
- [ ] `ownerOnly`, `groupOnly`, dan `privateOnly` bekerja.
- [ ] `adminOnly` dan `botAdminOnly` memeriksa metadata async.
- [ ] Denial message tidak membocorkan data internal.

## Verification
- Test menggunakan fake socket/group metadata.

## Dependencies
T22.

## Files
- `src/core/handler.js`
- `tests/guards.test.js`

## Scope
M — guard logic.
