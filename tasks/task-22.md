# T22 — Dispatcher plugin

## Tujuan
Menjalankan plugin terpilih dengan context yang disepakati.

## Acceptance criteria
- [ ] Command ditemukan dari registry.
- [ ] Context berisi sock/args/text/command/prefix/settings/utils.
- [ ] Plugin error diisolasi dan menghasilkan reply aman.
- [ ] Command tidak dikenal diabaikan.

## Verification
- `npm test -- tests/dispatcher.test.js`

## Dependencies
T20, T21.

## Files
- `src/core/handler.js`
- `tests/dispatcher.test.js`

## Scope
S — dispatcher dan test.
