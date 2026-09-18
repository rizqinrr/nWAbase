# T28 — Socket Elaina dasar

## Tujuan
Mengisolasi pembuatan socket WhatsApp dari runtime lainnya.

## Acceptance criteria
- [x] Auth state SQLite session digunakan.
- [x] Logger Pino digunakan.
- [x] `creds.update` terpasang.
- [x] Socket factory dapat diuji dengan dependency boundary.

## Verification
- Unit test factory dengan stub engine.

## Dependencies
T02, T06, T11.

## Files
- `src/core/connection.js`
- `tests/connection.test.js`

## Scope
M — integration boundary.
