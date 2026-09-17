# T31 — Graceful shutdown dan process errors

## Tujuan
Menutup socket, readline, watcher, dan database secara aman.

## Acceptance criteria
- [ ] SIGINT/SIGTERM idempotent.
- [ ] Resource ditutup meski salah satu close gagal.
- [ ] Uncaught exception/rejection dicatat tanpa secret.
- [ ] Process exit behavior terdokumentasi.

## Verification
- Unit test shutdown dengan fake resources.

## Dependencies
T20, T28, T30.

## Files
- `src/core/connection.js`
- `tests/shutdown.test.js`

## Scope
M — lifecycle cleanup.
