# T14 — Implementasi metadata message normalizer

## Tujuan
Membuat normalizer untuk metadata dasar pesan WhatsApp.

## Acceptance criteria
- [x] Key diubah menjadi id/chat/sender/fromMe.
- [x] Group terdeteksi dari JID.
- [x] Tipe dan text/caption diekstrak.
- [x] Input tanpa message tidak menyebabkan crash.

## Verification
- Jalankan test T15.

## Dependencies
T08, T13.

## Files
- `src/core/message.js`

## Scope
S — satu core module.
