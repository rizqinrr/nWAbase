# T25 — Interactive response routing

## Tujuan
Mengubah button/interactive response menjadi command ID tanpa prefix.

## Acceptance criteria
- [ ] Native flow response dibaca.
- [ ] Button/single select response dibaca.
- [ ] Invalid params JSON ditangani aman.
- [ ] Hanya response yang dikenali dirutekan tanpa prefix.

## Verification
- `npm test -- tests/interactive-routing.test.js`

## Dependencies
T21, T22.

## Files
- `src/core/message.js`
- `src/core/handler.js`
- `tests/interactive-routing.test.js`

## Scope
M — dua core boundary.
