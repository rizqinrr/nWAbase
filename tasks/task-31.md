# T31 — Graceful shutdown dan process errors

## Tujuan
Menutup socket, readline, watcher, dan database secara aman.

## Acceptance criteria
- [x] SIGINT/SIGTERM idempotent.
- [x] Resource ditutup meski salah satu close gagal.
- [x] Uncaught exception/rejection dicatat tanpa secret.
- [x] Process exit behavior terdokumentasi.

## Verification
- Unit test shutdown dengan fake resources.

## Dependencies
T20, T28, T30.

## Files
- `src/core/connection.js`
- `tests/shutdown.test.js`

## Scope
M — lifecycle cleanup.
