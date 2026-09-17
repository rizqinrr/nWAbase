# T19 — Test plugin validation dan loader

## Tujuan
Menguji plugin valid, invalid, alias, nested folder, dan duplicate trigger.

## Acceptance criteria
- [x] Plugin valid terdaftar.
- [x] Plugin invalid dilewati.
- [x] Alias terdaftar.
- [x] Duplicate tidak merusak registry sebelumnya.

## Verification
- `npm test -- tests/plugins.test.js`

## Dependencies
T18.

## Files
- `tests/plugins.test.js`
- `tests/fixtures/plugins/`

## Scope
M — test dan fixture.
