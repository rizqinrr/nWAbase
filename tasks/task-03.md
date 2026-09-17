# T03 — Buat folder skeleton dan aturan Git

## Tujuan
Membuat struktur direktori kosong dan aturan file sensitif.

## Acceptance criteria
- [x] `src/`, `src/core/`, `src/database/`, `src/utils/`, `plugins/example/`, dan `tests/` tersedia.
- [x] `.gitignore` mengecualikan `.env`, `store/`, dan seluruh file SQLite.
- [x] MIT `LICENSE` tersedia tanpa data personal.

## Verification
- `Test-Path` untuk seluruh folder.
- `git check-ignore .env store/session.db store/app.db`

## Dependencies
T02.

## Files
- `.gitignore`
- `LICENSE`
- folder skeleton

## Scope
S — konfigurasi dan file kosong.
