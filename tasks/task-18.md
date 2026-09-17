# T18 — Recursive plugin loader

## Tujuan
Memuat plugin ESM dari seluruh subfolder `plugins/`.

## Acceptance criteria
- [ ] File `.js` ditemukan secara rekursif.
- [ ] Default export dimuat.
- [ ] Metadata plugin disimpan.
- [ ] Error satu plugin tidak menghentikan scan lainnya.

## Verification
- Jalankan loader pada fixture plugin.

## Dependencies
T17.

## Files
- `src/core/plugins.js`

## Scope
S — loader module.
