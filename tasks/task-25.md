# T25 — Interactive response routing

## Tujuan
Mengubah button/interactive response menjadi command ID tanpa prefix.

## Acceptance criteria
- [x] Native flow response dibaca.
- [x] Button/single select response dibaca.
- [x] Invalid params JSON ditangani aman.
- [x] Hanya response yang dikenali dirutekan tanpa prefix.

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
