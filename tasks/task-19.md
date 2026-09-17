# T19 — Test plugin validation dan loader

## Tujuan
Menguji plugin valid, invalid, alias, nested folder, dan duplicate trigger.

## Acceptance criteria
- [ ] Plugin valid terdaftar.
- [ ] Plugin invalid dilewati.
- [ ] Alias terdaftar.
- [ ] Duplicate tidak merusak registry sebelumnya.

## Verification
- `npm test -- tests/plugins.test.js`

## Dependencies
T18.

## Files
- `tests/plugins.test.js`
- `tests/fixtures/plugins/`

## Scope
M — test dan fixture.
