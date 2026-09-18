# T29 — Pairing code dan QR option

## Tujuan
Menambahkan pilihan autentikasi yang dikonfigurasi tanpa source edit.

## Acceptance criteria
- [x] Pairing default aktif sesuai PRD.
- [x] Nomor berasal dari config lalu fallback prompt.
- [x] QR dapat digunakan saat pairing dimatikan.
- [x] Custom code memiliki fallback otomatis.

## Verification
- Test pairing branch dengan fake socket.

## Dependencies
T28.

## Files
- `src/core/connection.js`
- `tests/pairing.test.js`

## Scope
S — auth flow.
