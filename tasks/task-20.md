# T20 — Atomic reload dan watcher opt-in

## Tujuan
Menambahkan reload registry atomik dan watcher development opsional.

## Acceptance criteria
- [ ] Registry lama tetap aktif jika scan kandidat gagal.
- [ ] Swap registry terjadi setelah semua validasi lulus.
- [ ] Watcher hanya aktif saat `WATCH_PLUGINS=true`.
- [ ] Watcher dapat dihentikan.

## Verification
- `npm test -- tests/plugins-reload.test.js`

## Dependencies
T19, T06.

## Files
- `src/core/plugins.js`
- `tests/plugins-reload.test.js`

## Scope
M — lifecycle loader.
