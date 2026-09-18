# T30 — Reconnect policy

## Tujuan
Menangani disconnect non-logout dengan capped exponential backoff.

## Acceptance criteria
- [x] Delay meningkat hingga batas maksimum.
- [x] Logout tidak reconnect.
- [x] Tidak ada reconnect paralel.
- [x] Timer dapat dibatalkan.

## Verification
- `npm test -- tests/reconnect.test.js`

## Dependencies
T28.

## Files
- `src/core/connection.js`
- `tests/reconnect.test.js`

## Scope
M — lifecycle state.
