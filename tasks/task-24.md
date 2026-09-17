# T24 — Test routing dan guards

## Tujuan
Menggabungkan parser, dispatcher, dan guards dalam test perilaku.

## Acceptance criteria
- [ ] Command publik dapat dieksekusi.
- [ ] Command owner ditolak untuk non-owner.
- [ ] Group/private/admin guard menghasilkan perilaku benar.
- [ ] Plugin error tidak menghentikan pesan berikutnya.

## Verification
- `npm test -- tests/routing.test.js tests/guards.test.js`

## Dependencies
T23.

## Files
- `tests/routing.test.js`

## Scope
M — integration unit tests.
