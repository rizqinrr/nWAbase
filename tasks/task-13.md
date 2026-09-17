# T13 — Definisikan bentuk normalized message

## Tujuan
Mengunci bentuk objek pesan yang dipakai handler dan plugin.

## Acceptance criteria
- [x] Field key/chat/sender/fromMe/isGroup/txt/type terdokumentasi.
- [x] Mention dan quoted message memiliki bentuk konsisten.
- [x] Kontrak `reply`, `isAdmin`, dan `isBotAdmin` jelas.

## Verification
- Review contract fixture.

## Dependencies
T07.

## Files
- `src/core/message.js`
- `tests/fixtures/messages.js`

## Scope
S — desain object API.
