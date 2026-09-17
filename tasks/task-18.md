# T18 — Recursive plugin loader

## Tujuan
Memuat plugin ESM dari seluruh subfolder `plugins/`.

## Acceptance criteria
- [x] File `.js` ditemukan secara rekursif.
- [x] Default export dimuat.
- [x] Metadata plugin disimpan.
- [x] Error satu plugin tidak menghentikan scan lainnya.

## Verification
- Jalankan loader pada fixture plugin.

## Dependencies
T17.

## Files
- `src/core/plugins.js`

## Scope
S — loader module.
