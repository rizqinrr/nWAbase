# Utility Contract

`src/utils/index.js` mengekspor helper umum yang bebas fitur bisnis.

```js
export function normalizeJid(input)
export function parseJids(input)
export function extractMentions(text)
export function formatDuration(ms)
export function formatUptime(ms)
export function sleep(ms)
```

Aturan kontrak:

- `normalizeJid(input)` mengubah nomor menjadi JID pengguna `6281234567890` → `6281234567890@s.whatsapp.net`. Jika input sudah berbentuk JID, dikembalikan apa adanya. Input falsy menghasilkan `null`.
- `parseJids(input)` menerima string atau array, mengembalikan array JID unik dengan urutan input. Item kosong diabaikan.
- `extractMentions(text)` mengembalikan array JID dari mention `@6281234567890` dalam teks; tanpa duplikat. Input bukan string mengembalikan array kosong.
- `formatDuration(ms)` mengembalikan string ringkas seperti `1j 2m 3d` dari milidetik. Input bukan angka positif mengembalikan `0d`.
- `formatUptime(ms)` alias ramah manusia dari `formatDuration`.
- `sleep(ms)` mengembalikan Promise yang resolve setelah `ms` milidetik; `0` atau negatif resolve seketika.
- Tidak ada helper media, HTTP, AI, atau domain bisnis di modul ini.
