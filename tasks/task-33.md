# T33 — Integration smoke test

## Tujuan
Menguji alur socket event sampai plugin tanpa akun WhatsApp.

## Acceptance criteria
- [x] Fake message dapat mencapai dispatcher.
- [x] `ping` menghasilkan reply.
- [x] Error plugin tetap terisolasi.
- [x] Database test tidak meninggalkan store.

## Verification
- `npm test -- tests/integration.test.js`

## Dependencies
T32.

## Files
- `tests/integration.test.js`
- `tests/fakes/`

## Scope
M — integration test.
