# T39 — Audit keamanan dan hygiene repository

## Tujuan
Memastikan starter aman untuk publik sebelum live test.

## Acceptance criteria
- [ ] Tidak ada secret, nomor personal, session, DB runtime, atau log tracked.
- [ ] `.gitignore` mencakup seluruh artefak sensitif.
- [ ] Tidak ada eval/shell bawaan.
- [ ] Error/log tidak membocorkan credentials.

## Verification
- `git status --short`
- Secret pattern scan pada tracked files.
- Review dependency dan permission.

## Dependencies
T35, T37, T38.

## Files
- Repository files sesuai temuan audit.

## Scope
M — audit read-only/fix terbatas.
