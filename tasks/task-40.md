# T40 — Uji live, aktifkan template, dan siapkan release

## Tujuan
Memvalidasi acceptance criteria terakhir tanpa melakukan remote mutation otomatis.

## Acceptance criteria
- [ ] Pairing live dari HP berhasil.
- [ ] `!ping` berhasil di private chat dan grup bila tersedia.
- [ ] GitHub Template status dan release checklist siap.
- [ ] Versi `0.1.0` dan changelog/release notes konsisten.
- [ ] Commit, push, tag, dan pengaturan template menunggu persetujuan eksplisit.

## Verification
- Checklist manual live.
- Semua test/lint/typecheck/dry-run.
- `git diff --check` dan `git status`.

## Dependencies
T39.

## Files
- `README.md`
- `CHANGELOG.md` atau release notes bila disepakati
- GitHub repository settings secara manual

## Scope
M — validasi dan release preparation, bukan publish otomatis.
