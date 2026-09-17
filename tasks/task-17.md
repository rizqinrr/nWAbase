# T17 — Validasi plugin dan trigger

## Tujuan
Menolak plugin invalid dan trigger kosong/duplikat.

## Acceptance criteria
- [ ] Command string/array dan execute function divalidasi.
- [ ] Trigger dinormalisasi lowercase.
- [ ] Duplicate trigger menghasilkan error terstruktur.
- [ ] Plugin invalid tidak masuk registry.

## Verification
- Test cases dibuat sebelum implementasi final.

## Dependencies
T16.

## Files
- `src/core/plugins.js`
- `tests/plugins-validation.test.js`

## Scope
S — validator dan test.
