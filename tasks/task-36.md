# T36 — GitHub Actions Node 20/22

## Tujuan
Memastikan test dan quality checks berjalan di CI.

## Acceptance criteria
- [ ] Matrix Node 20 dan 22 tersedia.
- [ ] CI menjalankan install, test, lint, typecheck, dan plugin dry-run.
- [ ] Tidak ada secret yang dibutuhkan untuk test.

## Verification
- Validasi YAML.
- Jalankan command CI lokal.

## Dependencies
T33, T34, T35.

## Files
- `.github/workflows/ci.yml`

## Scope
S — satu workflow.
