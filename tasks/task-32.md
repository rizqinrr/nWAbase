# T32 — Wire runtime entrypoint

## Tujuan
Menghubungkan config, DB, loader, handler, dan connection dalam entrypoint.

## Acceptance criteria
- [ ] `src/index.js` menjadi entrypoint tunggal.
- [ ] Plugin dimuat sebelum pesan diproses.
- [ ] App DB diinisialisasi sekali.
- [ ] Runtime tidak memuat fitur bisnis.

## Verification
- `node --check src/index.js`
- Smoke start dengan connection stub.

## Dependencies
T25, T27, T31.

## Files
- `src/index.js`

## Scope
S — wiring.
