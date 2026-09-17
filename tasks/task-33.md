# T33 — Integration smoke test

## Tujuan
Menguji alur socket event sampai plugin tanpa akun WhatsApp.

## Acceptance criteria
- [ ] Fake message dapat mencapai dispatcher.
- [ ] `ping` menghasilkan reply.
- [ ] Error plugin tetap terisolasi.
- [ ] Database test tidak meninggalkan store.

## Verification
- `npm test -- tests/integration.test.js`

## Dependencies
T32.

## Files
- `tests/integration.test.js`
- `tests/fakes/`

## Scope
M — integration test.
