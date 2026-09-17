# T27 — Plugin dry-run

## Tujuan
Memastikan plugin example dapat divalidasi tanpa koneksi WhatsApp.

## Acceptance criteria
- [ ] Dry-run memuat `ping`.
- [ ] Jumlah plugin dan trigger dapat diperiksa.
- [ ] Proses exit nonzero bila plugin invalid.

## Verification
- `npm run test:plugins`

## Dependencies
T26.

## Files
- `scripts/test-plugins.js` atau script package

## Scope
S — tooling test.
