# T40 — Uji live, aktifkan template, dan siapkan release

## Tujuan
Memvalidasi acceptance criteria terakhir tanpa melakukan remote mutation otomatis.

## Acceptance criteria
- [ ] Pairing live dari HP berhasil.
- [ ] `!ping` berhasil di private chat dan grup bila tersedia.
- [x] GitHub Template status dan release checklist siap.
- [x] Versi `0.1.0` dan changelog/release notes konsisten.
- [x] Commit, push, tag, dan pengaturan template menunggu persetujuan eksplisit.

## Manual validation checklist

- [ ] Copy `.env.example` to `.env` with a real owner number locally.
- [ ] Run `npm start` and pair from a phone.
- [ ] Verify `!ping` in a private chat.
- [ ] Verify `!ping` in a group when a test group is available.
- [ ] Remove local `.env` and `store/` after testing.
- [x] Confirm GitHub repository Template status manually (`false` pada 2026-09-18).
- [x] Confirm release notes and version `0.1.0` before tagging.

Remote mutations are intentionally not automated by this task.

## Dependencies
T39.

## Files
- `README.md`
- `CHANGELOG.md` atau release notes bila disepakati
- GitHub repository settings secara manual

## Scope
M — validasi dan release preparation, bukan publish otomatis.
