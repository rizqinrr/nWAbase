# Changelog

Semua perubahan penting pada proyek ini didokumentasikan di file ini.

## [Unreleased]

### Pending validation

- Pairing live menggunakan akun WhatsApp.
- Verifikasi `!ping` di private chat dan grup.
- Aktivasi GitHub Template.
- Pembuatan tag dan GitHub Release `v0.1.0`.

## [0.1.0] - Unreleased

### Added

- Runtime ESM untuk Node.js 20+ dengan Elaina Baileys.
- SQLite auth state terpisah dari SQLite key-value aplikasi.
- Pairing code default dengan opsi QR dan fallback custom code.
- Capped exponential reconnect dan graceful shutdown.
- Normalisasi pesan, routing command, interactive response, dan plugin guards.
- Recursive plugin loader dengan validasi, duplicate detection, dan atomic reload.
- Plugin contoh `ping` dan dry-run plugin.
- Test suite `node:test`, ESLint, TypeScript `checkJs`, dan CI Node 20/22.

### Security

- Tidak menyertakan remote eval, shell, credential, session database, atau data personal.
- Error process dan plugin tidak mengekspos payload internal kepada pengguna.
